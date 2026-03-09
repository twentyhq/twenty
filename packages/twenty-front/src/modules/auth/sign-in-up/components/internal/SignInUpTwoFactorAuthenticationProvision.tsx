import { TwoFactorAuthenticationSetupEffect } from '@/auth/components/TwoFactorAuthenticationProvisionEffect';
import { qrCodeState } from '@/auth/states/qrCode';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { extractSecretFromOtpUri } from '@/settings/two-factor-authentication/utils/extractSecretFromOtpUri';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import QRCode from 'react-qr-code';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { IconCopy } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';
import { MainButton } from 'twenty-ui/input';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledMainContentContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[8]};
  margin-top: ${themeCssVariables.spacing[4]};
  text-align: center;
`;

const StyledTextContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};

  margin-bottom: ${themeCssVariables.spacing[4]};
  max-width: 280px;
  text-align: center;

  & > a {
    color: ${themeCssVariables.font.color.tertiary};
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
  align-items: center;
  background: none;
  border: none;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  margin-top: ${themeCssVariables.spacing[2]};
  padding: 0;
  text-decoration: underline;

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

export const SignInUpTwoFactorAuthenticationProvision = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const qrCode = useAtomStateValue(qrCodeState);
  const setSignInUpStep = useSetAtomState(signInUpStepState);

  const handleClick = () => {
    setSignInUpStep(SignInUpStep.TwoFactorAuthenticationVerification);
  };

  const handleCopySetupKey = async () => {
    if (!qrCode) return;

    const secret = extractSecretFromOtpUri(qrCode);
    if (secret !== null) {
      await copyToClipboard(secret, t`Setup key copied to clipboard`);
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
