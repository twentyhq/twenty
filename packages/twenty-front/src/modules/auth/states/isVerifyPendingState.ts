import { createState } from 'twenty-ui/utilities';
export const isVerifyPendingState = createState<boolean>({
  key: 'isVerifyPendingState',
  defaultValue: false,
});
