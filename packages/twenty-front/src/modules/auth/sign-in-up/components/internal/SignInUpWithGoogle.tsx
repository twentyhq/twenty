import { useLastAuthenticatedMethod } from '@/auth/sign-in-up/hooks/useLastAuthenticatedMethod';
import { useSignInWithGoogle } from '@/auth/sign-in-up/hooks/useSignInWithGoogle';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { type SocialSSOSignInUpActionType } from '@/auth/types/socialSSOSignInUp.type';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { memo } from 'react';
import { useRecoilValue } from 'recoil';
import { HorizontalSeparator, IconGoogle } from 'twenty-ui/display';
import { MainButton } from 'twenty-ui/input';
import {
  StyledLastUsedPill,
  StyledSSOButtonContainer,
} from './SignInUpSSOButtonStyles';

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
  const { lastAuthenticatedMethod, setLastAuthenticatedMethod } =
    useLastAuthenticatedMethod();
  const { signInWithGoogle } = useSignInWithGoogle();

  const handleClick = () => {
    setLastAuthenticatedMethod('google');
    signInWithGoogle({ action });
  };

  const isLastUsed = lastAuthenticatedMethod === 'google';

  return (
    <>
      <StyledSSOButtonContainer>
        <MainButton
          Icon={GoogleIcon}
          title={t`Continue with Google`}
          onClick={handleClick}
          variant={signInUpStep === SignInUpStep.Init ? undefined : 'secondary'}
          fullWidth
        />
        {isLastUsed && <StyledLastUsedPill label={t`Last`} />}
      </StyledSSOButtonContainer>
      <HorizontalSeparator visible={false} />
    </>
  );
};
