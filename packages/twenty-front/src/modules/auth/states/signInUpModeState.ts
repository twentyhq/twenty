import { createState } from 'twenty-ui';
import { SignInUpMode } from '@/auth/types/signInUpMode.type';

export const signInUpModeState = createState<SignInUpMode>({
  key: 'signInUpModeState',
  defaultValue: SignInUpMode.SignIn,
});
