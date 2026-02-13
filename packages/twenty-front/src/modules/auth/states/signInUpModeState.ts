import { SignInUpMode } from '@/auth/types/signInUpMode';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const signInUpModeState = createStateV2<SignInUpMode>({
  key: 'signInUpModeState',
  defaultValue: SignInUpMode.SignIn,
});
