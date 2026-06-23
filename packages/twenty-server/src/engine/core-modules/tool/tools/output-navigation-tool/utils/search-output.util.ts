import { isNonEmptyString } from '@sniptt/guards';
import RE2 from 're2';

import { SEARCH_OUTPUT_MAX_MATCH_LENGTH } from 'src/engine/core-modules/tool/tools/output-navigation-tool/constants/search-output-max-match-length.constant';
import { isDefined } from 'twenty-shared/utils';

export type SearchMatch = {
  charOffset: number;
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
    return new RE2(pattern, 'g');
  } catch {
    return new RE2(escapeRegExp(pattern), 'g');
  }
};

const truncateMatch = (match: string): string => {
  if (match.length <= SEARCH_OUTPUT_MAX_MATCH_LENGTH) {
    return match;
  }

  const half = Math.floor((SEARCH_OUTPUT_MAX_MATCH_LENGTH - 1) / 2);

  return `${match.slice(0, half)}…${match.slice(match.length - half)}`;
};

const buildContext = ({
  content,
  index,
  length,
  contextChars,
}: {
  content: string;
  index: number;
  length: number;
  contextChars: number;
}): string => {
  const start = Math.max(0, index - contextChars);
  const end = Math.min(content.length, index + length + contextChars);

  const prefix = start > 0 ? '…' : '';
  const suffix = end < content.length ? '…' : '';

  return `${prefix}${content.slice(start, end)}${suffix}`;
};

export const searchOutput = ({
  content,
  pattern,
  maxMatches,
  offset,
  contextChars,
}: {
  content: string;
  pattern: string;
  maxMatches: number;
  offset: number;
  contextChars: number;
}): SearchOutputResult => {
  const regex = compilePattern(pattern);

  const matches: SearchMatch[] = [];
  let totalMatches = 0;

  let execResult = regex.exec(content);

  while (isDefined(execResult)) {
    const index = execResult.index;
    const matched = execResult[0];

    if (totalMatches >= offset && matches.length < maxMatches) {
      matches.push({
        charOffset: index,
        match: truncateMatch(matched),
        context: buildContext({
          content,
          index,
          length: matched.length,
          contextChars,
        }),
      });
    }

    totalMatches += 1;

    if (matched.length === 0) {
      regex.lastIndex += 1;
    }

    execResult = regex.exec(content);
  }

  return {
    matches,
    totalMatches,
    hasMore: offset + matches.length < totalMatches,
  };
};
