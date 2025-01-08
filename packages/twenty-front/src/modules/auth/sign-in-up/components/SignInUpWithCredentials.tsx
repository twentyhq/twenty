import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { Form } from '@/auth/sign-in-up/hooks/useSignInUpForm';

import { Loader, MainButton } from 'twenty-ui';
import { isDefined } from '~/utils/isDefined';
import { SignInUpEmailField } from '@/auth/sign-in-up/components/SignInUpEmailField';
import { useRecoilValue } from 'recoil';
import styled from '@emotion/styled';
import { SignInUpPasswordField } from '@/auth/sign-in-up/components/SignInUpPasswordField';
import { useState, useMemo } from 'react';
import { captchaProviderState } from '@/client-config/states/captchaProviderState';
import { isRequestingCaptchaTokenState } from '@/captcha/states/isRequestingCaptchaTokenState';
import { useFormContext } from 'react-hook-form';
import { SignInUpMode } from '@/auth/types/signInUpMode';

const StyledForm = styled.form`
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const SignInUpWithCredentials = () => {
  const form = useFormContext<Form>();

  const signInUpStep = useRecoilValue(signInUpStepState);
  const [showErrors, setShowErrors] = useState(false);
  const captchaProvider = useRecoilValue(captchaProviderState);
  const isRequestingCaptchaToken = useRecoilValue(
    isRequestingCaptchaTokenState,
  );

  const {
    signInUpMode,
    continueWithEmail,
    continueWithCredentials,
    submitCredentials,
  } = useSignInUp(form);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitButtonDisabled) return;

    if (signInUpStep === SignInUpStep.Init) {
      continueWithEmail();
    } else if (signInUpStep === SignInUpStep.Email) {
      if (isDefined(form?.formState?.errors?.email)) {
        setShowErrors(true);
        return;
      }
      continueWithCredentials();
    } else if (signInUpStep === SignInUpStep.Password) {
      if (!form.formState.isSubmitting) {
        setShowErrors(true);
        form.handleSubmit(submitCredentials)();
      }
    }
  };

  const buttonTitle = useMemo(() => {
    if (signInUpStep === SignInUpStep.Init) {
      return 'Continue With Email';
    }

    if (
      signInUpMode === SignInUpMode.SignIn &&
      signInUpStep === SignInUpStep.Password
    ) {
      return 'Sign in';
    }

    if (
      signInUpMode === SignInUpMode.SignUp &&
      signInUpStep === SignInUpStep.Password
    ) {
      return 'Sign up';
    }

    return 'Continue';
  }, [signInUpMode, signInUpStep]);

  const shouldWaitForCaptchaToken =
    signInUpStep !== SignInUpStep.Init &&
    isDefined(captchaProvider?.provider) &&
    isRequestingCaptchaToken;

  const isEmailStepSubmitButtonDisabledCondition =
    signInUpStep === SignInUpStep.Email &&
    (isDefined(form.formState.errors['email']) || shouldWaitForCaptchaToken);

  // TODO: isValid is actually a proxy function. If it is not rendered the first time, react might not trigger re-renders
  // We make the isValid check synchronous and update a reactState to make sure this does not happen
  const isPasswordStepSubmitButtonDisabledCondition =
    signInUpStep === SignInUpStep.Password &&
    (!form.formState.isValid ||
      form.formState.isSubmitting ||
      shouldWaitForCaptchaToken);

  const isSubmitButtonDisabled =
    isEmailStepSubmitButtonDisabledCondition ||
    isPasswordStepSubmitButtonDisabledCondition;

  return (
    <>
      {(signInUpStep === SignInUpStep.Password ||
        signInUpStep === SignInUpStep.Email ||
        signInUpStep === SignInUpStep.Init) && (
        <StyledForm onSubmit={handleSubmit}>
          {signInUpStep !== SignInUpStep.Init && (
            <SignInUpEmailField showErrors={showErrors} />
          )}
          {signInUpStep === SignInUpStep.Password && (
            <SignInUpPasswordField
              showErrors={showErrors}
              signInUpMode={signInUpMode}
            />
          )}
          <MainButton
            title={buttonTitle}
            type="submit"
            variant={
              signInUpStep === SignInUpStep.Init ? 'secondary' : 'primary'
            }
            Icon={() => (form.formState.isSubmitting ? <Loader /> : null)}
            disabled={isSubmitButtonDisabled}
            fullWidth
          />
        </StyledForm>
      )}
    </>
  );
};
