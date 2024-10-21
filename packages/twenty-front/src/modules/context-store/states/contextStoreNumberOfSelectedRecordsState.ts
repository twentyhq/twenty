import { createState } from 'twenty-ui';

export const contextStoreNumberOfSelectedRecordsState = createState<number>({
  key: 'contextStoreNumberOfSelectedRecordsState',
  defaultValue: 0,
});
