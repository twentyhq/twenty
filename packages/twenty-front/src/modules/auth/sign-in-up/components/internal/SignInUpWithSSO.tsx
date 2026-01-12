import { useSSO } from '@/auth/sign-in-up/hooks/useSSO';
import {
  LAST_AUTHENTICATED_METHOD_STORAGE_KEY,
  lastAuthenticatedMethodState,
  type LastAuthenticatedMethod,
} from '@/auth/states/lastAuthenticatedMethodState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Pill } from 'twenty-ui/components';
import { HorizontalSeparator, IconLock } from 'twenty-ui/display';
import { MainButton } from 'twenty-ui/input';

const StyledButtonContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledLastUsedPill = styled(Pill)`
  position: absolute;
  right: -${({ theme }) => theme.spacing(2)};
  top: -${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => theme.color.blue};
  color: ${({ theme }) => theme.font.color.inverted};
`;

export const SignInUpWithSSO = () => {
  const theme = useTheme();
  const { t } = useLingui();
  const setSignInUpStep = useSetRecoilState(signInUpStepState);
  const workspaceAuthProviders = useRecoilValue(workspaceAuthProvidersState);
  const signInUpStep = useRecoilValue(signInUpStepState);
  const lastAuthenticatedMethod = useRecoilValue(lastAuthenticatedMethodState);

  const { redirectToSSOLoginPage } = useSSO();

  const signInWithSSO = () => {
    // Save to localStorage synchronously before redirect to ensure it persists
    localStorage.setItem(
      LAST_AUTHENTICATED_METHOD_STORAGE_KEY,
      JSON.stringify('sso' as LastAuthenticatedMethod),
    );
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
      <StyledButtonContainer>
        <MainButton
          Icon={() => <IconLock size={theme.icon.size.md} />}
          title={t`Single sign-on (SSO)`}
          onClick={signInWithSSO}
          variant={signInUpStep === SignInUpStep.Init ? undefined : 'secondary'}
          fullWidth
        />
        {isLastUsed && <StyledLastUsedPill label={t`Last`} />}
      </StyledButtonContainer>
      <HorizontalSeparator visible={false} />
    </>
  );
};
