import { createState } from 'twenty-ui';

export const objectRecordMultiSelectCheckedRecordsIdsState = createState<
  string[]
>({
  key: 'objectRecordMultiSelectCheckedRecordsIdsState',
  defaultValue: [],
});
