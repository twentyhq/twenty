import { AppPath } from '@/types/AppPath';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { IconMail, MainButton } from 'twenty-ui';

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

const StyledContentSection = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const SignUpEmailVerification = ({
  email,
}: {
  email: string | null;
}) => {
  const navigate = useNavigate();

  const navigateToLoginPage = () => {
    const url = encodeURI(
      `${AppPath.SignInUp}${email ? `?email=${email}` : ''}`,
    );

    navigate(url);
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
          {email ? 'Email verified' : 'Check your inbox'}
        </StyledTitle>
        <StyledDescription>
          {email
            ? 'Your email has been verified. Please login to continue.'
            : 'We sent you an email to verify your address. Please click the link in that email to confirm your account.'}
        </StyledDescription>

        <StyledButtonContainer>
          {email ? (
            <MainButton
              title="Continue with email"
              onClick={navigateToLoginPage}
              fullWidth
            />
          ) : (
            <MainButton
              title="Resend email"
              onClick={() => {
                // TODO#8240: Resend email
              }}
              fullWidth
            />
          )}
        </StyledButtonContainer>
      </StyledContentSection>
    </StyledContentContainer>
  );
};
