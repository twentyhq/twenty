import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { useHandleResendEmailVerificationToken } from '@/auth/sign-in-up/hooks/useHandleResendEmailVerificationToken';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { t } from '@lingui/core/macro';
import { useSetRecoilState } from 'recoil';
import { IconGmail, IconMail, IconMicrosoft } from 'twenty-ui/display';
import { MainButton } from 'twenty-ui/input';
import { RGBA } from 'twenty-ui/theme';
import { AnimatedEaseIn } from 'twenty-ui/utilities';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

const StyledMailContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border: 2px solid ${(props) => props.color};
  border-radius: 60px;
  box-shadow: ${(props) =>
    props.color && `-4px 4px 0 -2px ${RGBA(props.color, 1)}`};
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 40px;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(1)};
  width: 40px;
`;

const StyledTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(4)};
  text-align: center;
`;

const StyledEmail = styled.span`
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
  max-width: 240px;
`;

const StyledBottomLinks = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
`;

const StyledLinkButton = styled.button`
  background: none;
  border: none;
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: 140%;
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StyledDot = styled.div`
  background: ${({ theme }) => theme.font.color.light};
  border-radius: 50%;
  height: 2px;
  width: 2px;
`;

export const EmailVerificationSent = ({
  email,
  isError = false,
}: {
  email: string | null;
  isError?: boolean;
}) => {
  const theme = useTheme();
  const setSignInUpStep = useSetRecoilState(signInUpStepState);
  const color =
    theme.name === 'light' ? theme.grayScale.gray90 : theme.grayScale.gray10;

  const { handleResendEmailVerificationToken, loading: isLoading } =
    useHandleResendEmailVerificationToken();

  const handleOpenGmail = () => {
    const gmailUrl = email
      ? `https://mail.google.com/mail/u/${email}/`
      : 'https://mail.google.com/';
    window.open(gmailUrl, '_blank');
  };

  const handleOpenOutlook = () => {
    const outlookUrl = email
      ? `https://outlook.live.com/mail/${email}/`
      : 'https://outlook.live.com/';
    window.open(outlookUrl, '_blank');
  };

  const handleChangeEmail = () => {
    setSignInUpStep(SignInUpStep.Email);
  };

  return (
    <StyledContainer>
      <AnimatedEaseIn>
        <StyledMailContainer color={color}>
          <IconMail color={color} size={24} />
        </StyledMailContainer>
      </AnimatedEaseIn>

      <StyledTextContainer>
        <Title animate noMarginTop>
          {isError ? 'Email Verification Failed' : 'Check your Emails'}
        </Title>
        <SubTitle>
          {isError ? (
            <>
              {t`Oops! We encountered an issue verifying`}{' '}
              <StyledEmail>{email}</StyledEmail>.{' '}
              {t`Please request a new
              verification email and try again.`}
            </>
          ) : (
            <>
              {t`A verification email has been sent to`}{' '}
              <StyledEmail>{email}</StyledEmail>
            </>
          )}
        </SubTitle>
      </StyledTextContainer>

      <StyledButtonsContainer>
        <MainButton
          title={t`Open Gmail`}
          onClick={handleOpenGmail}
          Icon={IconGmail}
          variant="secondary"
          fullWidth
        />

        <MainButton
          title={t`Open Outlook`}
          onClick={handleOpenOutlook}
          Icon={IconMicrosoft}
          variant="secondary"
          fullWidth
        />
      </StyledButtonsContainer>

      <StyledBottomLinks>
        <StyledLinkButton
          onClick={handleResendEmailVerificationToken(email)}
          disabled={isLoading}
        >
          {isLoading ? t`Sending...` : t`Resend email`}
        </StyledLinkButton>
        <StyledDot />
        <StyledLinkButton onClick={handleChangeEmail}>
          {t`Change email`}
        </StyledLinkButton>
      </StyledBottomLinks>
    </StyledContainer>
  );
};
