import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { Key } from 'ts-key-enum';
import { TextInput } from '@/ui/input/components/TextInput';
import { SignInUpMode, useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { Loader, MainButton, StyledText } from 'twenty-ui';
import { isDefined } from '~/utils/isDefined';
import styled from '@emotion/styled';
import { Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useRecoilValue } from 'recoil';
import {
  useSignInUpForm,
  validationSchema,
} from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { captchaProviderState } from '@/client-config/states/captchaProviderState';
import { isRequestingCaptchaTokenState } from '@/captcha/states/isRequestingCaptchaTokenState';
import { useState, useMemo } from 'react';
import { useTheme } from '@emotion/react';

const StyledFullWidthMotionDiv = styled(motion.div)`
  width: 100%;
`;

const StyledForm = styled.form`
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledInputContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

export const SignInUpWithPassword = () => {
  const theme = useTheme();

  const signInUpStep = useRecoilValue(signInUpStepState);
  const captchaProvider = useRecoilValue(captchaProviderState);
  const isRequestingCaptchaToken = useRecoilValue(
    isRequestingCaptchaTokenState,
  );

  const { form } = useSignInUpForm();

  const {
    continueWithEmail,
    submitCredentials,
    continueWithCredentials,
    signInUpMode,
  } = useSignInUp(form);

  const [showErrors, setShowErrors] = useState(false);

  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === Key.Enter) {
      event.preventDefault();

      if (signInUpStep === SignInUpStep.Init) {
        continueWithEmail();
      } else if (signInUpStep === SignInUpStep.Email) {
        if (isDefined(form?.formState?.errors?.email)) {
          setShowErrors(true);
          return;
        }
        continueWithCredentials();
      }
    }
  };

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

  const buttonTitle = useMemo(() => {
    if (signInUpStep === SignInUpStep.Init) {
      return 'Continue With Email';
    }

    if (signInUpStep === SignInUpStep.Email) {
      return 'Continue';
    }

    if (SignInUpMode.SignIn && signInUpStep === SignInUpStep.Password) {
      return 'Sign in';
    }

    if (SignInUpMode.SignUp && signInUpStep === SignInUpStep.Password) {
      return 'Sign up';
    }
  }, [signInUpMode, signInUpStep]);

  return (
    <>
      {(signInUpStep === SignInUpStep.Password ||
        signInUpStep === SignInUpStep.Email ||
        signInUpStep === SignInUpStep.Init) && (
        <StyledForm
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          {signInUpStep !== SignInUpStep.Init && (
            <StyledFullWidthMotionDiv
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{
                type: 'spring',
                stiffness: 800,
                damping: 35,
              }}
            >
              <Controller
                name="email"
                control={form.control}
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <StyledInputContainer>
                    <TextInput
                      autoFocus
                      value={value}
                      placeholder="Email"
                      onBlur={onBlur}
                      onChange={(value: string) => {
                        onChange(value);
                        if (signInUpStep === SignInUpStep.Password) {
                          continueWithEmail();
                        }
                      }}
                      error={showErrors ? error?.message : undefined}
                      fullWidth
                      disableHotkeys
                      onKeyDown={handleKeyDown}
                    />
                  </StyledInputContainer>
                )}
              />
            </StyledFullWidthMotionDiv>
          )}
          {signInUpStep === SignInUpStep.Password && (
            <StyledFullWidthMotionDiv
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{
                type: 'spring',
                stiffness: 800,
                damping: 35,
              }}
            >
              <Controller
                name="password"
                control={form.control}
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <StyledInputContainer>
                    <TextInput
                      autoFocus
                      value={value}
                      type="password"
                      placeholder="Password"
                      onBlur={onBlur}
                      onChange={onChange}
                      error={showErrors ? error?.message : undefined}
                      fullWidth
                      disableHotkeys
                      onKeyDown={handleKeyDown}
                    />
                    {signInUpMode === SignInUpMode.SignUp && (
                      <StyledText
                        text={'At least 8 characters long.'}
                        color={theme.font.color.secondary}
                      />
                    )}
                  </StyledInputContainer>
                )}
              />
            </StyledFullWidthMotionDiv>
          )}
          <MainButton
            title={buttonTitle}
            type="submit"
            variant={
              signInUpStep === SignInUpStep.Init ? 'secondary' : 'primary'
            }
            onClick={async () => {
              if (signInUpStep === SignInUpStep.Init) {
                continueWithEmail();
                return;
              }
              if (signInUpStep === SignInUpStep.Email) {
                if (isDefined(form?.formState?.errors?.email)) {
                  setShowErrors(true);
                  return;
                }
                continueWithCredentials();
                return;
              }
              setShowErrors(true);
              form.handleSubmit(submitCredentials)();
            }}
            Icon={() => (form.formState.isSubmitting ? <Loader /> : null)}
            disabled={isSubmitButtonDisabled}
            fullWidth
          />
        </StyledForm>
      )}
    </>
  );
};
