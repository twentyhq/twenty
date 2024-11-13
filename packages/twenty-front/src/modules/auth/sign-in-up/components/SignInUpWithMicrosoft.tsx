import { IconMicrosoft, MainButton } from 'twenty-ui';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { useTheme } from '@emotion/react';
import { HorizontalSeparator } from '@/auth/sign-in-up/components/HorizontalSeparator';
import { useSignInWithMicrosoft } from '@/auth/sign-in-up/hooks/useSignInWithMicrosoft';
import { useRecoilValue } from 'recoil';

export const SignInUpWithMicrosoft = () => {
  const theme = useTheme();
  const signInUpStep = useRecoilValue(signInUpStepState);
  const { signInWithMicrosoft } = useSignInWithMicrosoft();

  return (
    <>
      <MainButton
        Icon={() => <IconMicrosoft size={theme.icon.size.lg} />}
        title="Continue with Microsoft"
        onClick={signInWithMicrosoft}
        variant={signInUpStep === SignInUpStep.Init ? undefined : 'secondary'}
        fullWidth
      />
      <HorizontalSeparator visible={false} />
    </>
  );
};
