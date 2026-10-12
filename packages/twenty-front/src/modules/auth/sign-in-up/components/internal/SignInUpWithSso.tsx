import { useHasMultipleAuthMethods } from '@/auth/sign-in-up/hooks/useHasMultipleAuthMethods';
import { useSso } from '@/auth/sign-in-up/hooks/useSso';
import { lastAuthenticatedMethodState } from '@/auth/states/lastAuthenticatedMethodState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { AuthenticatedMethod } from '@/auth/types/AuthenticatedMethod';
import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { IconLock } from 'twenty-ui/icon';
import { LastUsedPill } from './LastUsedPill';
import { StyledSsoButtonContainer } from './SignInUpSsoButtonStyles';
import { useTheme } from 'twenty-ui/theme';
import { SignInUpSeparator } from './SignInUpSeparator';

const StyledSsoSignInButton = styled(Button)`
  --tw-button-font-weight: var(--t-font-weight-semi-bold);
  --tw-button-padding-inline: var(--t-spacing-3);
`;

export const SignInUpWithSso = () => {
  const theme = useTheme();
  const { t } = useLingui();
  const setSignInUpStep = useSetAtomState(signInUpStepState);
  const workspaceAuthProviders = useAtomStateValue(workspaceAuthProvidersState);
  const signInUpStep = useAtomStateValue(signInUpStepState);
  const [lastAuthenticatedMethod, setLastAuthenticatedMethod] = useAtomState(
    lastAuthenticatedMethodState,
  );
  const hasMultipleAuthMethods = useHasMultipleAuthMethods();

  const { redirectToSsoLoginPage } = useSso();

  const signInWithSso = () => {
    setLastAuthenticatedMethod(AuthenticatedMethod.SSO);
    if (
      isDefined(workspaceAuthProviders) &&
      workspaceAuthProviders.sso.length === 1
    ) {
      return redirectToSsoLoginPage(workspaceAuthProviders.sso[0].id);
    }

    setSignInUpStep(SignInUpStep.SsoIdentityProviderSelection);
  };

  const isLastUsed = lastAuthenticatedMethod === AuthenticatedMethod.SSO;

  return (
    <>
      <StyledSsoButtonContainer>
        <StyledSsoSignInButton
          elevated
          startIcon={<IconLock size={theme.icon.size.md} />}
          onClick={signInWithSso}
          fullWidth
          variant={signInUpStep === SignInUpStep.Init ? 'solid' : 'outline'}
        >{t`Single sign-on (SSO)`}</StyledSsoSignInButton>
        {isLastUsed && hasMultipleAuthMethods && <LastUsedPill />}
      </StyledSsoButtonContainer>
      <SignInUpSeparator />
    </>
  );
};
