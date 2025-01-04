import { SignInUpMode } from '@/auth/types/signInUpMode';
import { createState } from '@ui/utilities/state/utils/createState';

export const signInUpModeState = createState<SignInUpMode>({
  key: 'signInUpModeState',
  defaultValue: SignInUpMode.SignIn,
});
