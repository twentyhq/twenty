import { createState } from 'twenty-ui';

export const isSignUpDisabledState = createState<boolean>({
  key: 'isSignUpDisabledState',
  defaultValue: false,
});
