import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useRecoilValue } from 'recoil';
import { z } from 'zod';

import { Logo } from '@/auth/components/Logo';
import { Title } from '@/auth/components/Title';
import { useAuth } from '@/auth/hooks/useAuth';
import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { PASSWORD_REGEX } from '@/auth/utils/passwordRegex';
import { billingState } from '@/client-config/states/billingState';
import { AppPath } from '@/types/AppPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { MainButton } from '@/ui/input/button/components/MainButton';
import { TextInput } from '@/ui/input/components/TextInput';
import { AnimatedEaseIn } from '@/ui/utilities/animation/components/AnimatedEaseIn';
import {
  useUpdatePasswordViaResetTokenMutation,
  useValidatePasswordResetTokenQuery,
} from '~/generated/graphql';
import { logError } from '~/utils/logError';

const validationSchema = z
  .object({
    passwordResetToken: z.string(),
    newPassword: z
      .string()
      .regex(PASSWORD_REGEX, 'Password must contain at least 8 characters'),
  })
  .required();

type Form = z.infer<typeof validationSchema>;

const StyledMainContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  width: 100%;
`;

const StyledContentContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  width: 200px;
`;

const StyledForm = styled.form`
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledFullWidthMotionDiv = styled(motion.div)`
  width: 100%;
`;

const StyledInputContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledFooterContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  text-align: center;
  max-width: 280px;
`;

export const PasswordReset = () => {
  const { enqueueSnackBar } = useSnackBar();

  const navigate = useNavigate();

  const [email, setEmail] = useState('');

  const theme = useTheme();

  const passwordResetToken = useParams().passwordResetToken;

  const isLoggedIn = useIsLogged();

  const { control, handleSubmit } = useForm<Form>({
    mode: 'onChange',
    defaultValues: {
      passwordResetToken: passwordResetToken ?? '',
      newPassword: '',
    },
    resolver: zodResolver(validationSchema),
  });

  const { loading: isValidatingToken } = useValidatePasswordResetTokenQuery({
    variables: {
      token: passwordResetToken ?? '',
    },
    skip: !passwordResetToken,
    onError: (error) => {
      enqueueSnackBar(error?.message ?? 'Token Invalid', {
        variant: 'error',
      });
      if (!isLoggedIn) {
        navigate(AppPath.SignIn);
      } else {
        navigate(AppPath.Index);
      }
    },
    onCompleted: (data) => {
      if (data?.validatePasswordResetToken?.email) {
        setEmail(data.validatePasswordResetToken.email);
      }
    },
  });

  const [updatePasswordViaToken, { loading: isUpdatingPassword }] =
    useUpdatePasswordViaResetTokenMutation();

  const { signInWithCredentials } = useAuth();

  const billing = useRecoilValue(billingState);

  const onSubmit = async (formData: Form) => {
    try {
      const { data } = await updatePasswordViaToken({
        variables: {
          token: formData.passwordResetToken,
          newPassword: formData.newPassword,
        },
      });

      if (!data?.updatePasswordViaResetToken.success) {
        enqueueSnackBar('There was an error while updating password.', {
          variant: 'error',
        });
        return;
      }

      if (isLoggedIn) {
        enqueueSnackBar('Password has been updated', {
          variant: 'success',
        });
        navigate(AppPath.Index);
        return;
      }

      const { workspace: currentWorkspace } = await signInWithCredentials(
        email || '',
        formData.newPassword,
      );

      if (
        billing?.isBillingEnabled &&
        currentWorkspace.subscriptionStatus !== 'active'
      ) {
        navigate(AppPath.PlanRequired);
        return;
      }

      if (currentWorkspace.displayName) {
        navigate(AppPath.Index);
        return;
      }

      navigate(AppPath.CreateWorkspace);
    } catch (err) {
      logError(err);
      enqueueSnackBar(
        (err as Error)?.message || 'An error occurred while updating password',
        {
          variant: 'error',
        },
      );
    }
  };

  return (
    <StyledMainContainer>
      <AnimatedEaseIn>
        <Logo />
      </AnimatedEaseIn>
      <Title animate>Reset Password</Title>
      <StyledContentContainer>
        {isValidatingToken && (
          <SkeletonTheme
            baseColor={theme.background.quaternary}
            highlightColor={theme.background.secondary}
          >
            <Skeleton
              height={32}
              count={2}
              style={{
                marginBottom: theme.spacing(2),
              }}
            />
          </SkeletonTheme>
        )}
        {email && (
          <StyledForm onSubmit={handleSubmit(onSubmit)}>
            <StyledFullWidthMotionDiv
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{
                type: 'spring',
                stiffness: 800,
                damping: 35,
              }}
            >
              <StyledInputContainer>
                <TextInput
                  autoFocus
                  value={email}
                  placeholder="Email"
                  fullWidth
                  disableHotkeys
                  disabled
                />
              </StyledInputContainer>
            </StyledFullWidthMotionDiv>
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
                name="newPassword"
                control={control}
                render={({
                  field: { onChange, onBlur, value },
                  fieldState: { error },
                }) => (
                  <StyledInputContainer>
                    <TextInput
                      autoFocus
                      value={value}
                      type="password"
                      placeholder="New Password"
                      onBlur={onBlur}
                      onChange={onChange}
                      error={error?.message}
                      fullWidth
                      disableHotkeys
                    />
                  </StyledInputContainer>
                )}
              />
            </StyledFullWidthMotionDiv>

            <MainButton
              variant="secondary"
              title="Change Password"
              type="submit"
              fullWidth
              disabled={isUpdatingPassword}
            />
          </StyledForm>
        )}
      </StyledContentContainer>
      <StyledFooterContainer>
        By using Twenty, you agree to the Terms of Service and Data Processing
        Agreement.
      </StyledFooterContainer>
    </StyledMainContainer>
  );
};
