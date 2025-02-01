import { SignInUpMode } from '@/auth/types/signInUpMode';
import { createState } from "twenty-shared";

export const signInUpModeState = createState<SignInUpMode>({
  key: 'signInUpModeState',
  defaultValue: SignInUpMode.SignIn,
});
