import { createState } from 'twenty-ui';

export const contextStoreTargetedRecordsState = createState<{
  selectedRecordIds: 'all' | string[];
  excludedRecordIds: string[];
}>({
  key: 'contextStoreTargetedRecordsState',
  defaultValue: {
    selectedRecordIds: [],
    excludedRecordIds: [],
  },
});
