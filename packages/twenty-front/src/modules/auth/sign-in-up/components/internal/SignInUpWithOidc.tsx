import { memo, useContext } from 'react';

import { useLingui } from '@lingui/react/macro';
import { IconKey } from 'twenty-ui/icon';
import { MainButton } from 'twenty-ui/input';
import { HorizontalSeparator } from 'twenty-ui/layout';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { useHasMultipleAuthMethods } from '@/auth/sign-in-up/hooks/useHasMultipleAuthMethods';
import { useSignInWithOidc } from '@/auth/sign-in-up/hooks/useSignInWithOidc';
import { lastAuthenticatedMethodState } from '@/auth/states/lastAuthenticatedMethodState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { AuthenticatedMethod } from '@/auth/types/AuthenticatedMethod.enum';
import { type SocialSSOSignInUpActionType } from '@/auth/types/socialSSOSignInUp.type';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { LastUsedPill } from './LastUsedPill';
import { StyledSSOButtonContainer } from './SignInUpSSOButtonStyles';

const OidcIcon = memo(() => {
  const { theme } = useContext(ThemeContext);
  return <IconKey size={theme.icon.size.md} />;
});

export const SignInUpWithOidc = ({
  action,
  isGlobalScope,
}: {
  action: SocialSSOSignInUpActionType;
  isGlobalScope?: boolean;
}) => {
  const { t } = useLingui();
  const authProviders = useAtomStateValue(authProvidersState);
  const signInUpStep = useAtomStateValue(signInUpStepState);
  const [lastAuthenticatedMethod, setLastAuthenticatedMethod] = useAtomState(
    lastAuthenticatedMethodState,
  );
  const { signInWithOidc } = useSignInWithOidc();
  const hasMultipleAuthMethods = useHasMultipleAuthMethods();

  const handleClick = () => {
    setLastAuthenticatedMethod(AuthenticatedMethod.OIDC);
    signInWithOidc({ action });
  };

  const isLastUsed = lastAuthenticatedMethod === AuthenticatedMethod.OIDC;
  const buttonTitle = authProviders.oidcButtonLabel
    ? `Continue with ${authProviders.oidcButtonLabel}`
    : t`Continue with OpenID Connect`;

  return (
    <>
      <StyledSSOButtonContainer>
        <MainButton
          Icon={OidcIcon}
          title={buttonTitle}
          onClick={handleClick}
          variant={signInUpStep === SignInUpStep.Init ? undefined : 'secondary'}
          fullWidth
        />
        {isLastUsed && (isGlobalScope || hasMultipleAuthMethods) && (
          <LastUsedPill />
        )}
      </StyledSSOButtonContainer>
      <HorizontalSeparator visible={false} />
    </>
  );
};
