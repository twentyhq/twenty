import { isDefined } from 'twenty-shared/utils';

import { CSS_CLOSING_DELIMITERS_BY_OPENING_DELIMITER } from '@/polyfills/media-query/constants/CssClosingDelimitersByOpeningDelimiter';

type GetNextExpectedCssClosingDelimitersInput = {
  expectedClosingDelimiters: string[];
  character: string;
};

export const getNextExpectedCssClosingDelimiters = ({
  expectedClosingDelimiters,
  character,
}: GetNextExpectedCssClosingDelimitersInput): string[] => {
  const openedBlockClosingDelimiter =
    CSS_CLOSING_DELIMITERS_BY_OPENING_DELIMITER.get(character);

  if (isDefined(openedBlockClosingDelimiter)) {
    return [...expectedClosingDelimiters, openedBlockClosingDelimiter];
  }

  const innermostExpectedClosingDelimiter =
    expectedClosingDelimiters[expectedClosingDelimiters.length - 1];
  const closesInnermostBlock = character === innermostExpectedClosingDelimiter;

  return closesInnermostBlock
    ? expectedClosingDelimiters.slice(0, -1)
    : expectedClosingDelimiters;
};
