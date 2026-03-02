import { SignInUpMode } from '@/auth/types/signInUpMode';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const signInUpModeState = createAtomState<SignInUpMode>({
  key: 'signInUpModeState',
  defaultValue: SignInUpMode.SignIn,
});
