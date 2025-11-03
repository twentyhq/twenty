import { SignInUpWithCredentials } from '@/auth/sign-in-up/components/internal/SignInUpWithCredentials';
import { SignInUpWithGoogle } from '@/auth/sign-in-up/components/internal/SignInUpWithGoogle';
import { SignInUpWithMicrosoft } from '@/auth/sign-in-up/components/internal/SignInUpWithMicrosoft';
import { SignInUpWithSSO } from '@/auth/sign-in-up/components/internal/SignInUpWithSSO';
import { useHandleResetPassword } from '@/auth/sign-in-up/hooks/useHandleResetPassword';
import { useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { useWorkspaceBypass } from '@/auth/sign-in-up/hooks/useWorkspaceBypass';
import { SignInUpStep } from '@/auth/states/signInUpStepState';
import { workspaceAuthBypassProvidersState } from '@/workspace/states/workspaceAuthBypassProvidersState';
import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { FormProvider } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import { HorizontalSeparator } from 'twenty-ui/display';
import { ClickToActionLink } from 'twenty-ui/navigation';

const StyledContentContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  min-width: 200px;
`;

export const SignInUpWorkspaceScopeForm = () => {
  const workspaceAuthProviders = useRecoilValue(workspaceAuthProvidersState);
  const workspaceAuthBypassProviders = useRecoilValue(
    workspaceAuthBypassProvidersState,
  );
  const { shouldOfferBypass, shouldUseBypass } = useWorkspaceBypass();

  const { form } = useSignInUpForm();

  const { handleResetPassword } = useHandleResetPassword();

  const { signInUpStep } = useSignInUp(form);

  if (!workspaceAuthProviders) {
    return null;
  }

  const providers =
    shouldOfferBypass && shouldUseBypass
      ? {
          ...workspaceAuthBypassProviders,
          sso: [],
        }
      : workspaceAuthProviders;

  return (
    <>
      <StyledContentContainer>
        {providers.google && <SignInUpWithGoogle action="join-workspace" />}

        {providers.microsoft && (
          <SignInUpWithMicrosoft action="join-workspace" />
        )}

        {providers.sso.length > 0 && <SignInUpWithSSO />}

        {(providers.google ||
          providers.microsoft ||
          providers.sso.length > 0) &&
        providers.password ? (
          <HorizontalSeparator />
        ) : null}
        {providers.password && (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <FormProvider {...form}>
            <SignInUpWithCredentials />
          </FormProvider>
        )}
      </StyledContentContainer>
      {signInUpStep === SignInUpStep.Password && (
        <ClickToActionLink
          onClick={handleResetPassword(form.getValues('email'))}
        >
          <Trans>Forgot your password?</Trans>
        </ClickToActionLink>
      )}
    </>
  );
};
