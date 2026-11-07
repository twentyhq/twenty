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
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import QRCodeModule from 'react-qr-code';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { MainButton } from 'twenty-ui/components/input';
import { IconCopy } from 'twenty-ui/icon';
import { Loader } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
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

export const SignInUpTwoFactorAuthenticationProvision = () => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const qrCode = useAtomStateValue(qrCodeState);
  const setSignInUpStep = useSetAtomState(signInUpStepState);

  const handleClick = () => {
    setSignInUpStep(SignInUpStep.TwoFactorAuthenticationVerification);
  };

  const handleCopySetupKey = async () => {
    if (!isNonEmptyString(qrCode)) {
      return;
    }

    const secret = extractSecretFromOtpUri(qrCode);
    if (isDefined(secret)) {
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
            <div style={{ marginTop: themeCssVariables.spacing[2] }}>
              <Button
                variant="link"
                size="sm"
                startIcon={<IconCopy />}
                onClick={handleCopySetupKey}
              >
                <Trans>Copy Setup Key</Trans>
              </Button>
            </div>
          )}
        </StyledTwoFactorMainContent>
        <MainButton onClick={handleClick} fullWidth>{t`Next`}</MainButton>
      </StyledForm>
    </>
  );
};
