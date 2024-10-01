import { createState } from 'twenty-ui';

export const targetedRecordIdsState = createState<string[]>({
  key: 'targetedRecordIdsState',
  defaultValue: [],
});
