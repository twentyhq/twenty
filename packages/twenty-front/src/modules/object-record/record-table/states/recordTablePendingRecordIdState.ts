import { createState } from 'twenty-ui';

export const recordTablePendingRecordIdState = createState<string | null>({
  key: 'recordTablePendingRecordIdState',
  defaultValue: null,
});
