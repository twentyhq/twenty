import { isDefined } from 'twenty-shared/utils';

export const getCommandMenuDefaultSelectedItemId = ({
  isSearchActive,
  firstCommandItemId,
  firstRecordItemId,
  askAiItemId,
  doesSearchReadAsQuestion,
}: {
  isSearchActive: boolean;
  firstCommandItemId?: string;
  firstRecordItemId?: string;
  askAiItemId?: string;
  doesSearchReadAsQuestion: boolean;
}): string | null | undefined => {
  if (!isSearchActive) {
    return undefined;
  }

  if (isDefined(firstCommandItemId)) {
    return firstCommandItemId;
  }

  if (isDefined(firstRecordItemId)) {
    return firstRecordItemId;
  }

  if (isDefined(askAiItemId) && doesSearchReadAsQuestion) {
    return askAiItemId;
  }

  return null;
};
