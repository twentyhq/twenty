import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { useHasMultipleAuthMethods } from '@/auth/sign-in-up/hooks/useHasMultipleAuthMethods';
import { useSignInWithGoogle } from '@/auth/sign-in-up/hooks/useSignInWithGoogle';
import { lastAuthenticatedMethodState } from '@/auth/states/lastAuthenticatedMethodState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { AuthenticatedMethod } from '@/auth/types/AuthenticatedMethod';
import { type SocialSsoSignInUpActionType } from '@/auth/types/SocialSsoSignInUpActionType';
import { useLingui } from '@lingui/react/macro';
import { memo } from 'react';
import { Button } from 'twenty-ui/primitives/input';
import { IconGoogle } from 'twenty-ui/icon';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { LastUsedPill } from './LastUsedPill';
import { StyledSsoButtonContainer } from './SignInUpSsoButtonStyles';
import { useTheme } from 'twenty-ui/theme';
import { SignInUpSeparator } from './SignInUpSeparator';

const StyledGoogleSignInButton = styled(Button)`
  --tw-button-font-weight: var(--t-font-weight-semi-bold);
  --tw-button-padding-inline: var(--t-spacing-3);
`;

const GoogleIcon = memo(() => {
  const theme = useTheme();
  return <IconGoogle size={theme.icon.size.md} />;
});

export const SignInUpWithGoogle = ({
  action,
  isGlobalScope,
}: {
  action: SocialSsoSignInUpActionType;
  isGlobalScope?: boolean;
}) => {
  const { t } = useLingui();
  const signInUpStep = useAtomStateValue(signInUpStepState);
  const [lastAuthenticatedMethod, setLastAuthenticatedMethod] = useAtomState(
    lastAuthenticatedMethodState,
  );
  const { signInWithGoogle } = useSignInWithGoogle();
  const hasMultipleAuthMethods = useHasMultipleAuthMethods();

  const handleClick = () => {
    setLastAuthenticatedMethod(AuthenticatedMethod.GOOGLE);
    signInWithGoogle({ action });
  };

  const isLastUsed = lastAuthenticatedMethod === AuthenticatedMethod.GOOGLE;

  return (
    <>
      <StyledSsoButtonContainer>
        <StyledGoogleSignInButton
          elevated
          startIcon={isDefined(GoogleIcon) ? <GoogleIcon /> : undefined}
          onClick={handleClick}
          fullWidth
          variant={signInUpStep === SignInUpStep.Init ? 'solid' : 'outline'}
        >{t`Continue with Google`}</StyledGoogleSignInButton>
        {isLastUsed && (isGlobalScope || hasMultipleAuthMethods) && (
          <LastUsedPill />
        )}
      </StyledSsoButtonContainer>
      <SignInUpSeparator />
    </>
  );
};
