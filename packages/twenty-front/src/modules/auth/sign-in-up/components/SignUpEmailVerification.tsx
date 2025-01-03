import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import { IconMail, StyledText } from 'twenty-ui';

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

export const SignUpEmailVerification = () => {
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
      <div>
        <StyledTitle>Check your inbox</StyledTitle>
        <StyledDescription>
          We sent you an email to verify your address. Please click the link in
          that email to confirm your account.
        </StyledDescription>
      </div>
      <StyledText
        color="secondary"
        text="Didn't receive the email? Check your spam folder."
      />
    </StyledContentContainer>
  );
};
