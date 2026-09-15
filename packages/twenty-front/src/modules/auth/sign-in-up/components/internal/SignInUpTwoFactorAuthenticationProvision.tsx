import { TwoFactorAuthenticationSetupEffect } from '@/auth/components/TwoFactorAuthenticationProvisionEffect';
import { qrCodeState } from '@/auth/states/qrCode';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import {
  StyledTwoFactorInstructions,
  StyledTwoFactorMainContent,
} from '@/auth/sign-in-up/components/internal/SignInUpTwoFactorAuthenticationStyles';
import { ONBOARDING_CONTENT_BLOCK_WIDTH } from '@/onboarding/constants/OnboardingContentBlockWidth';
import { extractSecretFromOtpUri } from '@/settings/two-factor-authentication/utils/extractSecretFromOtpUri';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import QRCodeModule from 'react-qr-code';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { IconCopy } from 'twenty-ui/icon';
import { Loader } from 'twenty-ui/feedback';
import { MainButton } from 'twenty-ui/input';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { resolveCjsModuleDefaultExport } from '~/utils/resolveCjsModuleDefaultExport';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const QRCode = resolveCjsModuleDefaultExport(QRCodeModule);

const StyledForm = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  width: ${ONBOARDING_CONTENT_BLOCK_WIDTH}px;
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
        <StyledTwoFactorInstructions>
          <Trans>
            Use authenticator apps and browser extensions like 1Password, Authy,
            Microsoft Authenticator to generate one-time passwords
          </Trans>
        </StyledTwoFactorInstructions>
        <StyledTwoFactorMainContent>
          {!qrCode ? <Loader /> : <QRCode value={qrCode} />}
          {qrCode && (
            <StyledCopySetupKeyLink onClick={handleCopySetupKey}>
              <IconCopy size={theme.icon.size.sm} />
              <Trans>Copy Setup Key</Trans>
            </StyledCopySetupKeyLink>
          )}
        </StyledTwoFactorMainContent>
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
