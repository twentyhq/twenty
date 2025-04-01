import { useSignInWithGitHub } from '@/auth/sign-in-up/hooks/useSignInWithGitHub';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react';
import { memo } from 'react';
import { useRecoilValue } from 'recoil';
import { HorizontalSeparator, IconGithub, MainButton } from 'twenty-ui';

const GitHubIcon = memo(() => {
  const theme = useTheme();
  return <IconGithub size={theme.icon.size.md} />;
});

export const SignInUpWithGitHub = () => {
  const { t } = useLingui();
  const signInUpStep = useRecoilValue(signInUpStepState);
  const { signInWithGitHub } = useSignInWithGitHub();

  return (
    <>
      <MainButton
        Icon={GitHubIcon}
        title={t`Continue with GitHub`}
        onClick={signInWithGitHub}
        variant={signInUpStep === SignInUpStep.Init ? undefined : 'secondary'}
        fullWidth
      />
      <HorizontalSeparator visible={false} />
    </>
  );
};