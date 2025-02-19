import { useSignInWithGoogle } from '@/auth/sign-in-up/hooks/useSignInWithGoogle';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { memo } from 'react';
import { useRecoilValue } from 'recoil';
import { HorizontalSeparator, IconGoogle, MainButton } from 'twenty-ui';

const GoogleIcon = memo(() => {
  const theme = useTheme();
  return <IconGoogle size={theme.icon.size.md} />;
});

export const SignInUpWithGoogle = () => {
  const { t } = useLingui();
  const signInUpStep = useRecoilValue(signInUpStepState);
  const { signInWithGoogle } = useSignInWithGoogle();

  return (
    <>
      <MainButton
        Icon={GoogleIcon}
        title={t`Continue with Google`}
        onClick={signInWithGoogle}
        variant={signInUpStep === SignInUpStep.Init ? undefined : 'secondary'}
        fullWidth
      />
      <HorizontalSeparator visible={false} />
    </>
  );
};
