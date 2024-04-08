import { createState } from 'twenty-ui';

export const isSignInPrefilledState = createState<boolean>({
  key: 'isSignInPrefilledState',
  defaultValue: false,
});
