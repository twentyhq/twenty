import { useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from '@emotion/react';

import { Logo } from "@/auth/components/Logo";
import { Title } from "@/auth/components/Title";
import { AnimatedEaseIn } from "@/ui/utilities/animation/components/AnimatedEaseIn";
import { TextInput } from '@/ui/input/components/TextInput';
import { PASSWORD_REGEX } from '@/auth/utils/passwordRegex';
import { useValidatePasswordResetTokenLazyQuery, useValidatePasswordResetTokenQuery } from '~/generated/graphql';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { AppPath } from '@/types/AppPath';
import { MainButton } from '@/ui/input/button/components/MainButton';

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

export const PasswordReset = () => {

    const { enqueueSnackBar } = useSnackBar();
    const navigate = useNavigate();

    const theme = useTheme();
    const passwordResetToken = useParams().passwordResetToken;

    const {control, handleSubmit} = useForm<Form>({
        mode: 'onChange',
        defaultValues: { passwordResetToken },
        resolver: zodResolver(validationSchema),
    })


    const [validateResetToken, { data, loading: isLoading, error }] = useValidatePasswordResetTokenLazyQuery({
        variables: {
            token: passwordResetToken || ''
        }
    });

    const onSubmit = (data) => {
      console.log(data);
    }

    useEffect(() => {
      validateResetToken({
        variables: { passwordResetToken },
        onError: () => {
          enqueueSnackBar(error?.message ?? 'Token Invalid', {
            variant: 'error'
          });
          navigate(AppPath.SignIn);
        }
      });
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
                    <Skeleton height={32} count={2} style={{
                      marginBottom: theme.spacing(2)
                    }}
                    />
                  </SkeletonTheme>
                )}
                {data?.validatePasswordResetToken?.email && (
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
          />
                                  </StyledForm>
                )}
            </StyledContentContainer>
        </>
    );
}