import { useLastAuthenticatedMethod } from '@/auth/sign-in-up/hooks/useLastAuthenticatedMethod';
import { useSSO } from '@/auth/sign-in-up/hooks/useSSO';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { HorizontalSeparator, IconLock } from 'twenty-ui/display';
import { MainButton } from 'twenty-ui/input';
import {
  StyledLastUsedPill,
  StyledSSOButtonContainer,
} from './SignInUpSSOButtonStyles';

export const SignInUpWithSSO = () => {
  const theme = useTheme();
  const { t } = useLingui();
  const setSignInUpStep = useSetRecoilState(signInUpStepState);
  const workspaceAuthProviders = useRecoilValue(workspaceAuthProvidersState);
  const signInUpStep = useRecoilValue(signInUpStepState);
  const { lastAuthenticatedMethod, setLastAuthenticatedMethod } =
    useLastAuthenticatedMethod();

  const { redirectToSSOLoginPage } = useSSO();

  const signInWithSSO = () => {
    setLastAuthenticatedMethod('sso');
    if (
      isDefined(workspaceAuthProviders) &&
      workspaceAuthProviders.sso.length === 1
    ) {
      return redirectToSSOLoginPage(workspaceAuthProviders.sso[0].id);
    }

    setSignInUpStep(SignInUpStep.SSOIdentityProviderSelection);
  };

  const isLastUsed = lastAuthenticatedMethod === 'sso';

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
        {isLastUsed && <StyledLastUsedPill label={t`Last`} />}
      </StyledSSOButtonContainer>
      <HorizontalSeparator visible={false} />
    </>
  );
};
