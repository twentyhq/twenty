import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { FormProvider } from 'react-hook-form';
import QRCode from 'react-qr-code';
import { useRecoilValue } from 'recoil';

import { qrCodeState } from '@/auth/states/qrCode';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { DeleteTwoFactorAuthentication } from '@/settings/two-factor-authentication/components/DeleteTwoFactorAuthenticationMethod';
import { TwoFactorAuthenticationSetupForSettingsEffect } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationSetupForSettingsEffect';
import {
  TwoFactorAuthenticationVerificationForSettings,
  useTwoFactorVerificationForSettings,
} from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationVerificationForSettings';
import { useCurrentUserWorkspaceTwoFactorAuthentication } from '@/settings/two-factor-authentication/hooks/useCurrentUserWorkspaceTwoFactorAuthentication';
import { extractSecretFromOtpUri } from '@/settings/two-factor-authentication/utils/extractSecretFromOtpUri';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useTheme } from '@emotion/react';
import { H2Title, IconCopy } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';
import { Section } from 'twenty-ui/layout';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledQRCodeContainer = styled.div`
  margin: ${({ theme }) => theme.spacing(4)} 0;
`;

const StyledInstructions = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  max-width: 400px;
`;

const StyledDivider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.border.color.light};
  margin: ${({ theme }) => theme.spacing(6)} 0;
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

export const SettingsTwoFactorAuthenticationMethod = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { enqueueSuccessSnackBar } = useSnackBar();
  const qrCode = useRecoilValue(qrCodeState);

  const { currentUserWorkspaceTwoFactorAuthenticationMethods } =
    useCurrentUserWorkspaceTwoFactorAuthentication();

  const has2FAMethod =
    currentUserWorkspaceTwoFactorAuthenticationMethods['TOTP']?.status ===
    'VERIFIED';

  const verificationForm = useTwoFactorVerificationForSettings();

  const shouldShowActionButtons = !has2FAMethod;

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
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...verificationForm.formConfig}>
      <SubMenuTopBarContainer
        title={t`Two Factor Authentication`}
        links={[
          {
            children: <Trans>User</Trans>,
            href: getSettingsPath(SettingsPath.ProfilePage),
          },
          {
            children: <Trans>Profile</Trans>,
            href: getSettingsPath(SettingsPath.ProfilePage),
          },
          {
            children: <Trans>Two-Factor Authentication</Trans>,
          },
        ]}
        actionButton={
          shouldShowActionButtons ? (
            <SaveAndCancelButtons
              isSaveDisabled={!verificationForm.canSave}
              isCancelDisabled={verificationForm.isSubmitting}
              isLoading={verificationForm.isLoading}
              onCancel={verificationForm.handleCancel}
              onSave={verificationForm.formConfig.handleSubmit(
                verificationForm.handleSave,
              )}
            />
          ) : undefined
        }
      >
        <SettingsPageContainer>
          {has2FAMethod ? (
            <Section>
              <DeleteTwoFactorAuthentication />
            </Section>
          ) : (
            <Section>
              <TwoFactorAuthenticationSetupForSettingsEffect />

              <H2Title title={t`1. Scan the QR code`} />
              <StyledInstructions>
                <Trans>
                  Use an authenticator app like Google Authenticator, Authy, or
                  Microsoft Authenticator to scan this QR code.
                </Trans>
              </StyledInstructions>
              <StyledQRCodeContainer>
                {!qrCode ? <Loader /> : <QRCode value={qrCode} />}
                {qrCode && (
                  <StyledCopySetupKeyLink onClick={handleCopySetupKey}>
                    <IconCopy size={theme.icon.size.sm} />
                    <Trans>Copy Setup Key</Trans>
                  </StyledCopySetupKeyLink>
                )}
              </StyledQRCodeContainer>

              <StyledDivider />

              <H2Title title={t`2. Enter the code`} />

              <StyledInstructions>
                <Trans>
                  Enter the 6-digit verification code from your authenticator
                  app to complete the setup.
                </Trans>
              </StyledInstructions>

              <TwoFactorAuthenticationVerificationForSettings />
            </Section>
          )}
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </FormProvider>
  );
};
