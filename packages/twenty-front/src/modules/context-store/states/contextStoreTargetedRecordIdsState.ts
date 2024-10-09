import { createState } from 'twenty-ui';

export const contextStoreTargetedRecordIdsState = createState<string[]>({
  key: 'contextStoreTargetedRecordIdsState',
  defaultValue: [],
});
