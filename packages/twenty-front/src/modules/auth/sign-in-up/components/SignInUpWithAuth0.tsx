import { useSignInWithAuth0 } from '@/auth/sign-in-up/hooks/useSignInWithAuth0';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { memo } from 'react';
import { useRecoilValue } from 'recoil';
import { HorizontalSeparator, IconAuth0, MainButton } from 'twenty-ui';

const Auth0Icon = memo(() => {
  const theme = useTheme();
  return <IconAuth0 size={theme.icon.size.md} />;
});

export const SignInUpWithAuth0 = () => {
  const { t } = useLingui();
  const signInUpStep = useRecoilValue(signInUpStepState);
  const { signInWithAuth0 } = useSignInWithAuth0();

  return (
    <>
      <MainButton
        Icon={Auth0Icon}
        title={t`Continue with Auth0`}
        onClick={signInWithAuth0}
        variant={signInUpStep === SignInUpStep.Init ? undefined : 'secondary'}
        fullWidth
      />
      <HorizontalSeparator visible={false} />
    </>
  );
};
