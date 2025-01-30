import { createState } from 'twenty-ui';

export const isUpsertingActivityInDBState = createState<boolean>({
  key: 'isUpsertingActivityInDBState',
  defaultValue: false,
});
