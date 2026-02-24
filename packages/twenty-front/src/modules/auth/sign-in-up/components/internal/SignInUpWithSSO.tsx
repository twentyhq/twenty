import { useHasMultipleAuthMethods } from '@/auth/sign-in-up/hooks/useHasMultipleAuthMethods';
import { useSSO } from '@/auth/sign-in-up/hooks/useSSO';
import { lastAuthenticatedMethodState } from '@/auth/states/lastAuthenticatedMethodState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { AuthenticatedMethod } from '@/auth/types/AuthenticatedMethod.enum';
import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { HorizontalSeparator, IconLock } from 'twenty-ui/display';
import { MainButton } from 'twenty-ui/input';
import { LastUsedPill } from './LastUsedPill';
import { StyledSSOButtonContainer } from './SignInUpSSOButtonStyles';

export const SignInUpWithSSO = () => {
  const theme = useTheme();
  const { t } = useLingui();
  const setSignInUpStep = useSetRecoilStateV2(signInUpStepState);
  const workspaceAuthProviders = useRecoilValueV2(workspaceAuthProvidersState);
  const signInUpStep = useRecoilValueV2(signInUpStepState);
  const [lastAuthenticatedMethod, setLastAuthenticatedMethod] =
    useRecoilStateV2(lastAuthenticatedMethodState);
  const hasMultipleAuthMethods = useHasMultipleAuthMethods();

  const { redirectToSSOLoginPage } = useSSO();

  const signInWithSSO = () => {
    setLastAuthenticatedMethod(AuthenticatedMethod.SSO);
    if (
      isDefined(workspaceAuthProviders) &&
      workspaceAuthProviders.sso.length === 1
    ) {
      return redirectToSSOLoginPage(workspaceAuthProviders.sso[0].id);
    }

    setSignInUpStep(SignInUpStep.SSOIdentityProviderSelection);
  };

  const isLastUsed = lastAuthenticatedMethod === AuthenticatedMethod.SSO;

  return (
    <>
      <StyledSSOButtonContainer>
        <MainButton
          Icon={() => <IconLock size={theme.icon.size.md} />}
          title={t`Single sign-on (SSO)`}
          onClick={signInWithSSO}
          variant={signInUpStep === SignInUpStep.Init ? undefined : 'secondary'}
          fullWidth
        />
        {isLastUsed && hasMultipleAuthMethods && <LastUsedPill />}
      </StyledSSOButtonContainer>
      <HorizontalSeparator visible={false} />
    </>
  );
};
