import { isDefined } from 'twenty-shared/utils';

const SURPLUS_CLOSE_BRACKETS_REGEX = /^\]+/;

export const getSurplusCloseBracketLength = ({
  textAfterClosing,
  openBracketLength,
}: {
  textAfterClosing: string;
  openBracketLength: number;
}): number => {
  const surplusMatch = SURPLUS_CLOSE_BRACKETS_REGEX.exec(textAfterClosing);

  if (!isDefined(surplusMatch)) {
    return 0;
  }

  return Math.min(surplusMatch[0].length, openBracketLength);
};
