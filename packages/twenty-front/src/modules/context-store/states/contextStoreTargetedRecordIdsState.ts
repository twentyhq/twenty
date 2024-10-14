import { createState } from 'twenty-ui';

export const contextStoreTargetedRecordIdsState = createState<{
  selectedRecordIds: 'all' | string[];
  excludedRecordIds: string[];
}>({
  key: 'contextStoreTargetedRecordIdsState',
  defaultValue: {
    selectedRecordIds: [],
    excludedRecordIds: [],
  },
});
