import { createState } from 'twenty-ui';

export const targetedRecordIds = createState<string[]>({
  key: 'targetedRecordIds',
  defaultValue: [],
});
