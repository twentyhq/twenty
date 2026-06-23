import { SEARCH_OUTPUT_MAX_LINE_LENGTH } from 'src/engine/core-modules/tool/tools/output-navigation-tool/constants/search-output-max-line-length.constant';

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

    const contextBlock: string[] = [];

    for (let cursor = start; cursor <= end; cursor++) {
      contextBlock.push(`${cursor + 1}: ${truncateLine(lines[cursor])}`);
    }

    return {
      lineNumber: lineIndex + 1,
      match: truncateLine(lines[lineIndex]),
      context: contextBlock.join('\n'),
    };
  });

  return {
    matches,
    totalMatches,
    hasMore: offset + selected.length < totalMatches,
  };
};
