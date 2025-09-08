import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { Logo } from '@/auth/components/Logo';
import { Title } from '@/auth/components/Title';
import { useAuth } from '@/auth/hooks/useAuth';
import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import { PASSWORD_REGEX } from '@/auth/utils/passwordRegex';
import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';
import { AppPath } from '@/types/AppPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInput } from '@/ui/input/components/TextInput';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { ApolloError } from '@apollo/client';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { MainButton } from 'twenty-ui/input';
import { AnimatedEaseIn } from 'twenty-ui/utilities';
import { z } from 'zod';
import {
  useUpdatePasswordViaResetTokenMutation,
  useValidatePasswordResetTokenQuery,
} from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { logError } from '~/utils/logError';

const validationSchema = z
  .object({
    passwordResetToken: z.string(),
    newPassword: z
      .string()
      .regex(PASSWORD_REGEX, 'Password must be min. 8 characters'),
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

const StyledMainButton = styled(MainButton)`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const PasswordReset = () => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const workspacePublicData = useRecoilValue(workspacePublicDataState);

  const navigate = useNavigateApp();

  const [email, setEmail] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(false);

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

  useValidatePasswordResetTokenQuery({
    variables: {
      token: passwordResetToken ?? '',
    },
    skip: !passwordResetToken || isTokenValid,
    onError: (error) => {
      enqueueErrorSnackBar({
        apolloError: error,
      });
      navigate(AppPath.Index);
    },
    onCompleted: (data) => {
      setIsTokenValid(true);
      if (isNonEmptyString(data?.validatePasswordResetToken?.email)) {
        setEmail(data.validatePasswordResetToken.email);
      }
    },
  });

  const [updatePasswordViaToken, { loading: isUpdatingPassword }] =
    useUpdatePasswordViaResetTokenMutation();

  const { signInWithCredentialsInWorkspace } = useAuth();
  const { readCaptchaToken } = useReadCaptchaToken();

  const onSubmit = async (formData: Form) => {
    try {
      const { data } = await updatePasswordViaToken({
        variables: {
          token: formData.passwordResetToken,
          newPassword: formData.newPassword,
        },
      });

      if (!data?.updatePasswordViaResetToken.success) {
        enqueueErrorSnackBar({
          message: t`There was an error while updating password.`,
        });
        return;
      }

      if (isLoggedIn) {
        enqueueSuccessSnackBar({
          message: t`Password has been updated`,
        });
        navigate(AppPath.Index);
        return;
      }

      const token = await readCaptchaToken();

      await signInWithCredentialsInWorkspace(
        email || '',
        formData.newPassword,
        token,
      );
      navigate(AppPath.Index);
    } catch (err) {
      logError(err);
      enqueueErrorSnackBar({
        apolloError: err instanceof ApolloError ? err : undefined,
      });
    }
  };

  return (
    isTokenValid && (
      <Modal.Content isVerticalCentered isHorizontalCentered>
        <StyledMainContainer>
          <AnimatedEaseIn>
            <Logo
              secondaryLogo={workspacePublicData?.logo}
              placeholder={workspacePublicData?.displayName}
            />
          </AnimatedEaseIn>
          <Title animate>
            <Trans>Reset Password</Trans>
          </Title>
          <StyledContentContainer>
            {!email ? (
              <SkeletonTheme
                baseColor={theme.background.quaternary}
                highlightColor={theme.background.secondary}
              >
                <Skeleton
                  height={SKELETON_LOADER_HEIGHT_SIZES.standard.m}
                  count={2}
                  style={{ marginBottom: theme.spacing(2) }}
                />
              </SkeletonTheme>
            ) : (
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
                      placeholder={t`Email`}
                      fullWidth
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
                          placeholder={t`New Password`}
                          onBlur={onBlur}
                          onChange={onChange}
                          error={error?.message}
                          fullWidth
                        />
                      </StyledInputContainer>
                    )}
                  />
                </StyledFullWidthMotionDiv>

                <StyledMainButton
                  variant="secondary"
                  title={t`Change Password`}
                  type="submit"
                  fullWidth
                  disabled={isUpdatingPassword}
                />
              </StyledForm>
            )}
          </StyledContentContainer>
        </StyledMainContainer>
      </Modal.Content>
    )
  );
};
