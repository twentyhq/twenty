import { ALL_RECORD_GROUPS_TAB_ID } from '@/object-record/record-group/constants/AllRecordGroupsTabId';
import { isDefined } from 'twenty-shared/utils';

type GetActiveRecordGroupTabIdArgs = {
  selectedRecordGroupId: string | null;
  visibleRecordGroupIds: string[];
};

export const getActiveRecordGroupTabId = ({
  selectedRecordGroupId,
  visibleRecordGroupIds,
}: GetActiveRecordGroupTabIdArgs): string => {
  if (
    isDefined(selectedRecordGroupId) &&
    (selectedRecordGroupId === ALL_RECORD_GROUPS_TAB_ID ||
      visibleRecordGroupIds.includes(selectedRecordGroupId))
  ) {
    return selectedRecordGroupId;
  }

  return visibleRecordGroupIds[0] ?? ALL_RECORD_GROUPS_TAB_ID;
};
