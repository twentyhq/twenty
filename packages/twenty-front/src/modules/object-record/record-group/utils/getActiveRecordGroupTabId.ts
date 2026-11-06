import { isDefined } from 'twenty-shared/utils';

type GetActiveRecordGroupTabIdArgs = {
  selectedRecordGroupId: string | null;
  visibleRecordGroupIds: string[];
};

export const getActiveRecordGroupTabId = ({
  selectedRecordGroupId,
  visibleRecordGroupIds,
}: GetActiveRecordGroupTabIdArgs): string | null => {
  if (
    isDefined(selectedRecordGroupId) &&
    visibleRecordGroupIds.includes(selectedRecordGroupId)
  ) {
    return selectedRecordGroupId;
  }

  return visibleRecordGroupIds[0] ?? null;
};
