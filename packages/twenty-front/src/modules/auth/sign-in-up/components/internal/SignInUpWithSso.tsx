import { styled } from '@linaria/react';
import { useHasMultipleAuthMethods } from '@/auth/sign-in-up/hooks/useHasMultipleAuthMethods';
import { useSso } from '@/auth/sign-in-up/hooks/useSso';
import { lastAuthenticatedMethodState } from '@/auth/states/lastAuthenticatedMethodState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { AuthenticatedMethod } from '@/auth/types/AuthenticatedMethod.enum';
import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconLock } from 'twenty-ui/icon';
import { HorizontalSeparator } from 'twenty-ui/layout';
import { Button } from 'twenty-ui/input';
import { LastUsedPill } from './LastUsedPill';
import { StyledSsoButtonContainer } from './SignInUpSsoButtonStyles';
import { useContext } from 'react';
import { themeCssVariables, ThemeContext } from 'twenty-ui/theme-constants';

const StyledActionButton = styled(Button)`
  font-weight: ${themeCssVariables.font.weight.semiBold};
  padding-inline: ${themeCssVariables.spacing[3]};
`;

export const SignInUpWithSso = () => {
  const { theme } = useContext(ThemeContext);
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
        <StyledActionButton
          startIcon={<IconLock size={theme.icon.size.md} />}
          onClick={signInWithSso}
          fullWidth
          elevated
          variant={signInUpStep === SignInUpStep.Init ? 'solid' : 'outline'}
        >{t`Single sign-on (SSO)`}</StyledActionButton>
        {isLastUsed && hasMultipleAuthMethods && <LastUsedPill />}
      </StyledSsoButtonContainer>
      <HorizontalSeparator visible={false} />
    </>
  );
};
