import { SignInUpWithCredentials } from '@/auth/sign-in-up/components/SignInUpWithCredentials';
import { SignInUpWithGoogle } from '@/auth/sign-in-up/components/SignInUpWithGoogle';
import { SignInUpWithMicrosoft } from '@/auth/sign-in-up/components/SignInUpWithMicrosoft';
import { SignInUpWithSSO } from '@/auth/sign-in-up/components/SignInUpWithSSO';
import { useHandleResetPassword } from '@/auth/sign-in-up/hooks/useHandleResetPassword';
import { useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { SignInUpStep } from '@/auth/states/signInUpStepState';
import { workspaceAuthProvidersState } from '@/workspace/states/workspaceAuthProvidersState';
import styled from '@emotion/styled';
import { FormProvider } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import { ActionLink, HorizontalSeparator } from 'twenty-ui';

const StyledContentContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export const SignInUpWorkspaceScopeForm = () => {
  const workspaceAuthProviders = useRecoilValue(workspaceAuthProvidersState);

  const { form } = useSignInUpForm();

  const { handleResetPassword } = useHandleResetPassword();

  const { signInUpStep } = useSignInUp(form);

  return (
    <>
      <StyledContentContainer>
        {workspaceAuthProviders.google && <SignInUpWithGoogle />}

        {workspaceAuthProviders.microsoft && <SignInUpWithMicrosoft />}

        {workspaceAuthProviders.sso.length > 0 && <SignInUpWithSSO />}

        {(workspaceAuthProviders.google ||
          workspaceAuthProviders.microsoft ||
          workspaceAuthProviders.sso.length > 0) &&
        workspaceAuthProviders.password ? (
          <HorizontalSeparator />
        ) : null}
        {workspaceAuthProviders.password && (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <FormProvider {...form}>
            <SignInUpWithCredentials />
          </FormProvider>
        )}
      </StyledContentContainer>
      {signInUpStep === SignInUpStep.Password && (
        <ActionLink onClick={handleResetPassword(form.getValues('email'))}>
          Forgot your password?
        </ActionLink>
      )}
    </>
  );
};
