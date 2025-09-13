import { TwoFactorAuthenticationSetupEffect } from '@/auth/components/TwoFactorAuthenticationProvisionEffect';
import { qrCodeState } from '@/auth/states/qrCode';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { extractSecretFromOtpUri } from '@/settings/two-factor-authentication/utils/extractSecretFromOtpUri';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import QRCode from 'react-qr-code';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { IconCopy } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';
import { MainButton } from 'twenty-ui/input';

const StyledMainContentContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  text-align: center;
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

const StyledCopySetupKeyLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-top: ${({ theme }) => theme.spacing(2)};
  padding: 0;
  text-decoration: underline;

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

export const SignInUpTwoFactorAuthenticationProvision = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { enqueueSuccessSnackBar } = useSnackBar();
  const qrCode = useRecoilValue(qrCodeState);
  const setSignInUpStep = useSetRecoilState(signInUpStepState);

  const handleClick = () => {
    setSignInUpStep(SignInUpStep.TwoFactorAuthenticationVerification);
  };

  const handleCopySetupKey = async () => {
    if (!qrCode) return;

    const secret = extractSecretFromOtpUri(qrCode);
    if (secret !== null) {
      await navigator.clipboard.writeText(secret);
      enqueueSuccessSnackBar({
        message: t`Setup key copied to clipboard`,
        options: {
          icon: <IconCopy size={theme.icon.size.md} />,
          duration: 2000,
        },
      });
    }
  };

  return (
    <>
      <TwoFactorAuthenticationSetupEffect />
      <StyledForm>
        <StyledTextContainer>
          <Trans>
            Use authenticator apps and browser extensions like 1Password, Authy,
            Microsoft Authenticator to generate one-time passwords
          </Trans>
        </StyledTextContainer>
        <StyledMainContentContainer>
          {!qrCode ? <Loader /> : <QRCode value={qrCode} />}
          {qrCode && (
            <StyledCopySetupKeyLink onClick={handleCopySetupKey}>
              <IconCopy size={theme.icon.size.sm} />
              <Trans>Copy Setup Key</Trans>
            </StyledCopySetupKeyLink>
          )}
        </StyledMainContentContainer>
        <MainButton
          title={t`Next`}
          onClick={handleClick}
          variant="primary"
          fullWidth
        />
      </StyledForm>
    </>
  );
};
