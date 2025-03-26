import { createState } from 'twenty-ui';

export const isVerifyPendingState = createState<boolean>({
  key: 'isVerifyPendingState',
  defaultValue: false,
});
