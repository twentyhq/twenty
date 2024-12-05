import { useHandleResetPassword } from '@/auth/sign-in-up/hooks/useHandleResetPassword';
import { useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { SignInUpStep } from '@/auth/states/signInUpStepState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
import { ActionLink, HorizontalSeparator } from 'twenty-ui';
import { SignInUpWithGoogle } from '@/auth/sign-in-up/components/SignInUpWithGoogle';
import { SignInUpWithMicrosoft } from '@/auth/sign-in-up/components/SignInUpWithMicrosoft';
import { SignInUpWithSSO } from '@/auth/sign-in-up/components/SignInUpWithSSO';
import { SignInUpWithCredentials } from '@/auth/sign-in-up/components/SignInUpWithCredentials';

const StyledContentContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export const SignInUpWorkspaceScopeForm = () => {
  const [authProviders] = useRecoilState(authProvidersState);

  const { form } = useSignInUpForm();
  const { handleResetPassword } = useHandleResetPassword();

  const { signInUpStep } = useSignInUp(form);

  return (
    <>
      <StyledContentContainer>
        {authProviders.google && <SignInUpWithGoogle />}

        {authProviders.microsoft && <SignInUpWithMicrosoft />}

        {authProviders.sso.length > 0 && <SignInUpWithSSO />}

        {(authProviders.google ||
          authProviders.microsoft ||
          authProviders.sso.length > 0) &&
        authProviders.password ? (
          <HorizontalSeparator visible />
        ) : null}

        {authProviders.password && <SignInUpWithCredentials />}
      </StyledContentContainer>
      {signInUpStep === SignInUpStep.Password && (
        <ActionLink onClick={handleResetPassword(form.getValues('email'))}>
          Forgot your password?
        </ActionLink>
      )}
    </>
  );
};
