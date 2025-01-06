import styled from '@emotion/styled';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { useHandleResendEmailVerificationToken } from '@/auth/sign-in-up/hooks/useHandleResendEmailVerificationToken';
import { useTheme } from '@emotion/react';
import { AnimatedEaseIn, IconMail, MainButton, RGBA } from 'twenty-ui';

const StyledMailContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  border: 2px solid ${(props) => props.color};
  border-radius: ${({ theme }) => theme.border.radius.rounded};
  box-shadow: ${(props) =>
    props.color && `-4px 4px 0 -2px ${RGBA(props.color, 1)}`};
  height: 36px;
  width: 36px;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledButtonContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

export const EmailVerificationSent = ({ email }: { email: string | null }) => {
  const theme = useTheme();
  const color =
    theme.name === 'light' ? theme.grayScale.gray90 : theme.grayScale.gray10;

  const { handleResendEmailVerificationToken } =
    useHandleResendEmailVerificationToken();

  return (
    <>
      <AnimatedEaseIn>
        <StyledMailContainer color={color}>
          <IconMail color={color} size={24} stroke={3} />
        </StyledMailContainer>
      </AnimatedEaseIn>
      <Title animate>Confirm Your Email Address</Title>
      <SubTitle>
        {`A verification email has been sent to ${email}. Please check your inbox
        and click the link in the email to activate your account.`}
      </SubTitle>
      <StyledButtonContainer>
        <MainButton
          title="Click to resend"
          onClick={handleResendEmailVerificationToken(email)}
          width={200}
        />
      </StyledButtonContainer>
    </>
  );
};
