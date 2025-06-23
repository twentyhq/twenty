import styled from '@emotion/styled';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { useHandleResendEmailVerificationToken } from '@/auth/sign-in-up/hooks/useHandleResendEmailVerificationToken';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { OnboardingModalCircularIcon } from '@/onboarding/components/OnboardingModalCircularIcon';
import { t } from '@lingui/core/macro';
import { useSetRecoilState } from 'recoil';
import {
  IconGmail,
  IconMail,
  IconMailX,
  IconMicrosoft,
} from 'twenty-ui/display';
import { MainButton } from 'twenty-ui/input';
import { AnimatedEaseIn } from 'twenty-ui/utilities';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

const StyledTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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
  const setSignInUpStep = useSetRecoilState(signInUpStepState);

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

  const title = isError ? t`Email Verification Failed` : t`Check your Emails`;
  const subtitle = isError
    ? t`We encountered an issue verifying`
    : t`A verification email has been sent to`;

  const Icon = isError ? IconMailX : IconMail;

  const mainButtons = isError ? (
    <>
      <MainButton
        title={t`Try with another email`}
        onClick={handleChangeEmail}
        variant="secondary"
        fullWidth
      />
      <MainButton
        title={isLoading ? t`Sending...` : t`Resend email`}
        onClick={handleResendEmailVerificationToken(email)}
        disabled={isLoading}
        fullWidth
      />
    </>
  ) : (
    <>
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
    </>
  );

  return (
    <StyledContainer>
      <AnimatedEaseIn>
        <OnboardingModalCircularIcon Icon={Icon} />
      </AnimatedEaseIn>

      <StyledTextContainer>
        <Title animate noMarginTop>
          {title}
        </Title>
        <SubTitle>
          {subtitle} <StyledEmail>{email}</StyledEmail>
        </SubTitle>
      </StyledTextContainer>

      <StyledButtonsContainer>{mainButtons}</StyledButtonsContainer>

      {!isError && (
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
      )}
    </StyledContainer>
  );
};
