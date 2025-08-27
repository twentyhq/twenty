import { useSignInWithGoogle } from '@/auth/sign-in-up/hooks/useSignInWithGoogle';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { memo } from 'react';
import { useRecoilValue } from 'recoil';
import { HorizontalSeparator, IconGoogle } from 'twenty-ui/display';
import { MainButton } from 'twenty-ui/input';
import { type SocialSSOSignInUpActionType } from '@/auth/types/socialSSOSignInUp.type';

const GoogleIcon = memo(() => {
  const theme = useTheme();
  return <IconGoogle size={theme.icon.size.md} />;
});

export const SignInUpWithGoogle = ({
  action,
}: {
  action: SocialSSOSignInUpActionType;
}) => {
  const { t } = useLingui();
  const signInUpStep = useRecoilValue(signInUpStepState);
  const { signInWithGoogle } = useSignInWithGoogle();
  return (
    <>
      <MainButton
        Icon={GoogleIcon}
        title={t`Continue with Google`}
        onClick={() => signInWithGoogle({ action })}
        variant={signInUpStep === SignInUpStep.Init ? undefined : 'secondary'}
        fullWidth
      />
      <HorizontalSeparator visible={false} />
    </>
  );
};
