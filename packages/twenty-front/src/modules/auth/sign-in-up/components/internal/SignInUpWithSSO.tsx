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
import { HorizontalSeparator, IconLock } from 'twenty-ui/display';
import { MainButton } from 'twenty-ui/input';
import { LastUsedPill } from './LastUsedPill';
import { StyledSsoButtonContainer } from './SignInUpSsoButtonStyles';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

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
    setLastAuthenticatedMethod(AuthenticatedMethod.Sso);
    if (
      isDefined(workspaceAuthProviders) &&
      workspaceAuthProviders.Sso.length === 1
    ) {
      return redirectToSsoLoginPage(workspaceAuthProviders.Sso[0].id);
    }

    setSignInUpStep(SignInUpStep.SsoIdentityProviderSelection);
  };

  const isLastUsed = lastAuthenticatedMethod === AuthenticatedMethod.Sso;

  return (
    <>
      <StyledSsoButtonContainer>
        <MainButton
          Icon={() => <IconLock size={theme.icon.size.md} />}
          title={t`Single sign-on (Sso)`}
          onClick={signInWithSso}
          variant={signInUpStep === SignInUpStep.Init ? undefined : 'secondary'}
          fullWidth
        />
        {isLastUsed && hasMultipleAuthMethods && <LastUsedPill />}
      </StyledSsoButtonContainer>
      <HorizontalSeparator visible={false} />
    </>
  );
};
