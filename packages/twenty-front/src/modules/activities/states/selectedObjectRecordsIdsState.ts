import { createState } from 'twenty-ui';

export const selectedObjectRecordsIdsState = createState<string[]>({
  key: 'selectedObjectRecordsIdsState',
  defaultValue: [],
});
