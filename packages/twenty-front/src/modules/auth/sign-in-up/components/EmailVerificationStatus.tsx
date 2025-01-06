import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { IconMail, Loader, MainButton } from 'twenty-ui';
import { useResendEmailVerificationTokenMutation } from '~/generated/graphql';

const StyledContentContainer = styled(motion.div)`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  text-align: center;
  width: 100%;
`;

const StyledIconContainer = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: 50%;
  display: flex;
  height: 48px;
  justify-content: center;
  width: 48px;
`;

const StyledContentSection = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
`;

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: ${({ theme }) => theme.text.lineHeight.md};
  max-width: 320px;
`;

const StyledButtonContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(6)};
  width: 200px;
`;

export const EmailVerificationStatus = ({
  email,
  isEmailVerified,
}: {
  email: string;
  isEmailVerified: boolean;
}) => {
  const [resendEmailVerificationToken, { loading }] =
    useResendEmailVerificationTokenMutation();

  const { enqueueSnackBar } = useSnackBar();

  const handleResendEmailVerificationToken = async () => {
    try {
      await resendEmailVerificationToken({ variables: { email } });
      enqueueSnackBar('A new email verification token has been sent!', {
        variant: SnackBarVariant.Success,
      });
    } catch (error) {
      enqueueSnackBar(
        'Unable to resend the email verification token. Please try again.',
        {
          variant: SnackBarVariant.Error,
        },
      );
    }
  };

  return (
    <StyledContentContainer
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{
        type: 'spring',
        stiffness: 800,
        damping: 35,
      }}
    >
      <StyledIconContainer>
        <IconMail size={24} />
      </StyledIconContainer>
      <StyledContentSection>
        <StyledTitle>
          {isEmailVerified
            ? 'Your email has been verified!'
            : 'Email verification failed'}
        </StyledTitle>
        <StyledDescription>
          {isEmailVerified
            ? `Congratulations! ${email} is now verified. You can log in to continue.`
            : `Oops! We encountered an issue verifying ${email}. Please request a new verification email and try again.`}
        </StyledDescription>

        <StyledButtonContainer>
          {isEmailVerified ? (
            <Link to={`${AppPath.SignInUp}?email=${email}`}>
              <MainButton title="Proceed to Login" fullWidth />
            </Link>
          ) : (
            <MainButton
              title="Resend Verification Email"
              onClick={handleResendEmailVerificationToken}
              disabled={loading}
              Icon={() => loading && <Loader />}
              fullWidth
            />
          )}
        </StyledButtonContainer>
      </StyledContentSection>
    </StyledContentContainer>
  );
};
