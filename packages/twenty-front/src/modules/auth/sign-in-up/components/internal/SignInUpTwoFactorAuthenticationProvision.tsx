import styled from '@emotion/styled';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { qrCodeState } from '@/auth/states/qrCode';
import { Loader } from 'twenty-ui/feedback';
import QRCode from 'react-qr-code';
import { Trans } from '@lingui/react/macro';
import { MainButton } from 'twenty-ui/input';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { TwoFactorAuthenticationSetupEffect } from '@/auth/components/TwoFactorAuthenticationProvisionEffect';

const StyledMainContentContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  text-align: center;
  space-y: 5px;
`;

const StyledTextContainer = styled.div`
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  color: ${({ theme }) => theme.font.color.tertiary};

  max-width: 280px;
  text-align: center;
  font-size: ${({ theme }) => theme.font.size.sm};

  & > a {
    color: ${({ theme }) => theme.font.color.tertiary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const StyledForm = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const SignInUpTwoFactorAuthenticationProvisioning = () => {
  const qrCode = useRecoilValue(qrCodeState);
  const setSignInUpStep = useSetRecoilState(signInUpStepState);

  const handleClick = () => {
    setSignInUpStep(SignInUpStep.TwoFactorAuthenticationVerification);
  };

  return (
    <>
      <TwoFactorAuthenticationSetupEffect />
      <StyledForm>
        <StyledTextContainer>
          <Trans>Use authenticator apps and browser extensions like</Trans>{' '}
          <a
            href="https://twenty.com/legal/terms"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Trans>1Password</Trans>,
          </a>{' '}
          <a
            href="https://twenty.com/legal/terms"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Trans>Authy</Trans>,
          </a>{' '}
          <a
            href="https://twenty.com/legal/terms"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Trans>Microsoft</Trans>,
          </a>{' '}
          <a
            href="https://twenty.com/legal/terms"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Trans>Authenticator</Trans>
          </a>{' '}
          <Trans>to generate one-time passwords</Trans>
        </StyledTextContainer>
        <StyledMainContentContainer>
          {!qrCode 
            ? <Loader /> 
            : <QRCode value={qrCode} 
          />}
        </StyledMainContentContainer>
        <MainButton
          title={'Next'}
          onClick={handleClick}
          variant={'primary'}
          fullWidth
        />
      </StyledForm>
    </>
  );
};