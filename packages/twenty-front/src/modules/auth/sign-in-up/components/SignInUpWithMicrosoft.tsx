import { useSignInWithMicrosoft } from '@/auth/sign-in-up/hooks/useSignInWithMicrosoft';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { HorizontalSeparator, IconMicrosoft, MainButton } from 'twenty-ui';

export const SignInUpWithMicrosoft = () => {
  const theme = useTheme();
  const { t } = useLingui();

  const signInUpStep = useRecoilValue(signInUpStepState);
  const { signInWithMicrosoft } = useSignInWithMicrosoft();

  return (
    <>
      <MainButton
        Icon={() => <IconMicrosoft size={theme.icon.size.md} />}
        title={t`Continue with Microsoft`}
        onClick={signInWithMicrosoft}
        variant={signInUpStep === SignInUpStep.Init ? undefined : 'secondary'}
        fullWidth
      />
      <HorizontalSeparator visible={false} />
    </>
  );
};
