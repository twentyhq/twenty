import { IconGoogle, MainButton, HorizontalSeparator } from 'twenty-ui';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { useTheme } from '@emotion/react';
import { useRecoilValue } from 'recoil';
import { useSignInWithGoogle } from '@/auth/sign-in-up/hooks/useSignInWithGoogle';

export const SignInUpWithGoogle = () => {
  const theme = useTheme();
  const signInUpStep = useRecoilValue(signInUpStepState);
  const { signInWithGoogle } = useSignInWithGoogle();

  return (
    <>
      <MainButton
        Icon={() => <IconGoogle size={theme.icon.size.md} />}
        title="Continue with Google"
        onClick={signInWithGoogle}
        variant={signInUpStep === SignInUpStep.Init ? undefined : 'secondary'}
        fullWidth
      />
      <HorizontalSeparator visible={false} />
    </>
  );
};
