import { useEffect, useState } from 'react';
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
import { PASSWORD_REGEX } from '@/auth/utils/passwordRegex';
import { billingState } from '@/client-config/states/billingState';
import { AppPath } from '@/types/AppPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { MainButton } from '@/ui/input/button/components/MainButton';
import { TextInput } from '@/ui/input/components/TextInput';
import { AnimatedEaseIn } from '@/ui/utilities/animation/components/AnimatedEaseIn';
import {
  useUpdatePasswordViaResetTokenMutation,
  useValidatePasswordResetTokenLazyQuery,
} from '~/generated/graphql';

const validationSchema = z
  .object({
    passwordResetToken: z.string(),
    newPassword: z
      .string()
      .regex(PASSWORD_REGEX, 'Password must contain at least 8 characters'),
  })
  .required();

type Form = z.infer<typeof validationSchema>;

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

  const { control, handleSubmit } = useForm<Form>({
    mode: 'onChange',
    defaultValues: {
      passwordResetToken: passwordResetToken ?? '',
      newPassword: '',
    },
    resolver: zodResolver(validationSchema),
  });

  const [validateResetToken, { data, loading: isLoading, error }] =
    useValidatePasswordResetTokenLazyQuery();

  const [
    updatePasswordViaToken,
    {
      data: updatePasswordData,
      loading: isUpdatingPassword,
      error: updatingPasswordError,
    },
  ] = useUpdatePasswordViaResetTokenMutation();

  const { signInWithCredentials } = useAuth();

  const billing = useRecoilValue(billingState);

  const onSubmit = async (data: Form) => {
    try {
      await updatePasswordViaToken({
        variables: {
          token: data.passwordResetToken,
          newPassword: data.newPassword,
        },
      });

      const { workspace: currentWorkspace } = await signInWithCredentials(
        email || '',
        data.newPassword,
      );

      if (
        billing?.isBillingEnabled &&
        currentWorkspace.subscriptionStatus !== 'active'
      ) {
        navigate('/plan-required');
        return;
      }

      if (currentWorkspace.displayName) {
        navigate('/');
        return;
      }

      navigate('/create/workspace');
    } catch (err) {
      console.error('there was some error', err);
    }
  };

  useEffect(() => {
    const validateToken = async () => {
      if (passwordResetToken) {
        const { data } = await validateResetToken({
          variables: { passwordResetToken },
          onError: () => {
            enqueueSnackBar(error?.message ?? 'Token Invalid', {
              variant: 'error',
            });
            navigate(AppPath.SignIn);
          },
        });

        if (data?.validatePasswordResetToken?.email) {
          setEmail(data.validatePasswordResetToken.email);
        }
      }
    };
    validateToken();
  }, []);

  return (
    <>
      <AnimatedEaseIn>
        <Logo />
      </AnimatedEaseIn>
      <Title animate>Reset Password</Title>
      <StyledContentContainer>
        {isLoading && (
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
                  value={data.validatePasswordResetToken.email}
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
    </>
  );
};
