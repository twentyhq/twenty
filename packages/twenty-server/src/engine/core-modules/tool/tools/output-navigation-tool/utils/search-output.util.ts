import { isNonEmptyString } from '@sniptt/guards';
import { SEARCH_OUTPUT_MAX_LINE_LENGTH } from 'src/engine/core-modules/tool/tools/output-navigation-tool/constants/search-output-max-line-length.constant';
import { isDefined } from 'twenty-shared/utils';

export type SearchMatch = {
  lineNumber: number;
  match: string;
  context: string;
};

export type SearchOutputResult = {
  matches: SearchMatch[];
  totalMatches: number;
  hasMore: boolean;
};

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const compilePattern = (pattern: string): RegExp => {
  if (!isNonEmptyString(pattern)) {
    throw new Error('Search pattern must be a non-empty string.');
  }

  try {
    return new RegExp(pattern);
  } catch {
    return new RegExp(escapeRegExp(pattern));
  }
};

const truncateLine = (line: string): string =>
  line.length > SEARCH_OUTPUT_MAX_LINE_LENGTH
    ? `${line.slice(0, SEARCH_OUTPUT_MAX_LINE_LENGTH)}…`
    : line;


const truncateAroundMatch = (
  line: string,
  matchIndex: number,
  matchLength: number,
): string => {
  if (line.length <= SEARCH_OUTPUT_MAX_LINE_LENGTH) {
    return line;
  }

  const matchCenter = matchIndex + Math.floor(matchLength / 2);
  const half = Math.floor(SEARCH_OUTPUT_MAX_LINE_LENGTH / 2);

  const end = Math.min(line.length, Math.max(matchCenter + half, half * 2));
  const start = Math.max(0, end - SEARCH_OUTPUT_MAX_LINE_LENGTH);

  const prefix = start > 0 ? '…' : '';
  const suffix = end < line.length ? '…' : '';

  return `${prefix}${line.slice(start, end)}${suffix}`;
};

export const searchOutput = ({
  content,
  pattern,
  maxMatches,
  offset,
  contextLines,
}: {
  content: string;
  pattern: string;
  maxMatches: number;
  offset: number;
  contextLines: number;
}): SearchOutputResult => {
  const lines = content.split('\n');
  const regex = compilePattern(pattern);

  const matchLineIndices: number[] = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    if (regex.test(lines[lineIndex])) {
      matchLineIndices.push(lineIndex);
    }
  }

  const totalMatches = matchLineIndices.length;
  const selected = matchLineIndices.slice(offset, offset + maxMatches);

  const matches: SearchMatch[] = selected.map((lineIndex) => {
    const start = Math.max(0, lineIndex - contextLines);
    const end = Math.min(lines.length - 1, lineIndex + contextLines);

    const matchInLine = regex.exec(lines[lineIndex]);

    const truncateMatchedLine = (line: string): string =>
      isDefined(matchInLine)
        ? truncateAroundMatch(line, matchInLine.index, matchInLine[0].length)
        : truncateLine(line);

    const contextBlock: string[] = [];

    for (let cursor = start; cursor <= end; cursor++) {
      const lineText =
        cursor === lineIndex
          ? truncateMatchedLine(lines[cursor])
          : truncateLine(lines[cursor]);

      contextBlock.push(`${cursor + 1}: ${lineText}`);
    }

    return {
      lineNumber: lineIndex + 1,
      match: truncateMatchedLine(lines[lineIndex]),
      context: contextBlock.join('\n'),
    };
  });

  return {
    matches,
    totalMatches,
    hasMore: offset + selected.length < totalMatches,
  };
};
