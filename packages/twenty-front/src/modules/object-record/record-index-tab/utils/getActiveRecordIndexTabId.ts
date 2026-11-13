import { RECORD_INDEX_ALL_TAB_ID } from '@/object-record/record-index-tab/constants/RecordIndexAllTabId';
import { isDefined } from 'twenty-shared/utils';

type GetActiveRecordIndexTabIdArgs = {
  selectedRecordIndexTabId: string | null;
  recordIndexTabIds: string[];
};

export const getActiveRecordIndexTabId = ({
  selectedRecordIndexTabId,
  recordIndexTabIds,
}: GetActiveRecordIndexTabIdArgs): string => {
  if (
    isDefined(selectedRecordIndexTabId) &&
    recordIndexTabIds.includes(selectedRecordIndexTabId)
  ) {
    return selectedRecordIndexTabId;
  }

  return recordIndexTabIds[0] ?? RECORD_INDEX_ALL_TAB_ID;
};
