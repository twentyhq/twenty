import styled from '@emotion/styled';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { useHandleResendEmailVerificationToken } from '@/auth/sign-in-up/hooks/useHandleResendEmailVerificationToken';
import { useTheme } from '@emotion/react';
import { AnimatedEaseIn, IconMail, Loader, MainButton, RGBA } from 'twenty-ui';

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

const StyledEmail = styled.span`
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledButtonContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

export const EmailVerificationSent = ({
  email,
  isError = false,
}: {
  email: string | null;
  isError?: boolean;
}) => {
  const theme = useTheme();
  const color =
    theme.name === 'light' ? theme.grayScale.gray90 : theme.grayScale.gray10;

  const { handleResendEmailVerificationToken, loading: isLoading } =
    useHandleResendEmailVerificationToken();

  return (
    <>
      <AnimatedEaseIn>
        <StyledMailContainer color={color}>
          <IconMail color={color} size={24} stroke={3} />
        </StyledMailContainer>
      </AnimatedEaseIn>
      <Title animate>
        {isError ? 'Email Verification Failed' : 'Confirm Your Email Address'}
      </Title>
      <SubTitle>
        {isError ? (
          <>
            Oops! We encountered an issue verifying{' '}
            <StyledEmail>{email}</StyledEmail>. Please request a new
            verification email and try again.
          </>
        ) : (
          <>
            A verification email has been sent to{' '}
            <StyledEmail>{email}</StyledEmail>. Please check your inbox and
            click the link in the email to activate your account.
          </>
        )}
      </SubTitle>
      <StyledButtonContainer>
        <MainButton
          title="Click to resend"
          onClick={handleResendEmailVerificationToken(email)}
          Icon={() => (isLoading ? <Loader /> : undefined)}
          width={200}
        />
      </StyledButtonContainer>
    </>
  );
};
