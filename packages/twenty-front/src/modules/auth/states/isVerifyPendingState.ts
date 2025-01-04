import { createState } from '@ui/utilities/state/utils/createState';

export const isVerifyPendingState = createState<boolean>({
  key: 'isVerifyPendingState',
  defaultValue: false,
});
