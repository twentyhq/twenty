import { SignInUpEmailField } from '@/auth/sign-in-up/components/SignInUpEmailField';
import { SignInUpPasswordField } from '@/auth/sign-in-up/components/SignInUpPasswordField';
import { useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { SignInUpMode } from '@/auth/types/signInUpMode';
import { isRequestingCaptchaTokenState } from '@/captcha/states/isRequestingCaptchaTokenState';
import { captchaProviderState } from '@/client-config/states/captchaProviderState';
import styled from '@emotion/styled';
import { useMemo, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { Loader, MainButton } from 'twenty-ui';
import { isDefined } from '~/utils/isDefined';

const StyledForm = styled.form`
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const SignInUpWithCredentials = () => {
  const { form, validationSchema } = useSignInUpForm();
  const { t } = useTranslation();
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
      return t('continueWithEmail');
    }

    if (
      signInUpMode === SignInUpMode.SignIn &&
      signInUpStep === SignInUpStep.Password
    ) {
      return t('signIn');
    }

    if (
      signInUpMode === SignInUpMode.SignUp &&
      signInUpStep === SignInUpStep.Password
    ) {
      return t('signUp');
    }

    return t('continue');
  }, [signInUpMode, signInUpStep]);

  const shouldWaitForCaptchaToken =
    signInUpStep !== SignInUpStep.Init &&
    isDefined(captchaProvider?.provider) &&
    isRequestingCaptchaToken;

  const isEmailStepSubmitButtonDisabledCondition =
    signInUpStep === SignInUpStep.Email &&
    (!validationSchema.shape.email.safeParse(form.watch('email')).success ||
      shouldWaitForCaptchaToken);

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
        <>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <FormProvider {...form}>
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
          </FormProvider>
        </>
      )}
    </>
  );
};
