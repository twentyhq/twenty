import { useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { type Form } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';

import { SignInUpEmailField } from '@/auth/sign-in-up/components/internal/SignInUpEmailField';
import { SignInUpPasswordField } from '@/auth/sign-in-up/components/internal/SignInUpPasswordField';
import { SignInUpMode } from '@/auth/types/signInUpMode';
import { isRequestingCaptchaTokenState } from '@/captcha/states/isRequestingCaptchaTokenState';
import { captchaState } from '@/client-config/states/captchaState';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Loader } from 'twenty-ui/feedback';
import { MainButton } from 'twenty-ui/input';

const StyledForm = styled.form`
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const SignInUpWithCredentials = () => {
  const { t } = useLingui();
  const form = useFormContext<Form>();

  const [signInUpStep, setSignInUpStep] = useRecoilState(signInUpStepState);
  const [showErrors, setShowErrors] = useState(false);
  const captcha = useRecoilValue(captchaState);
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

  const onEmailChange = (email: string) => {
    if (email !== form.getValues('email')) {
      setSignInUpStep(SignInUpStep.Email);
    }
  };

  const buttonTitle = useMemo(() => {
    if (signInUpStep === SignInUpStep.Init) {
      return t`Continue with Email`;
    }

    if (
      signInUpMode === SignInUpMode.SignIn &&
      signInUpStep === SignInUpStep.Password
    ) {
      return t`Sign in`;
    }

    if (
      signInUpMode === SignInUpMode.SignUp &&
      signInUpStep === SignInUpStep.Password
    ) {
      return t`Sign up`;
    }

    return t`Continue`;
  }, [signInUpMode, signInUpStep, t]);

  const shouldWaitForCaptchaToken =
    signInUpStep !== SignInUpStep.Init &&
    isDefined(captcha?.provider) &&
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
            <SignInUpEmailField
              showErrors={showErrors}
              onInputChange={onEmailChange}
            />
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
