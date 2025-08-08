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
  align-items: center;
  background-color: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: inline-flex;
  flex-direction: column;
  margin: ${({ theme }) => theme.spacing(4)} 0;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledInstructions = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  max-width: 450px;
  line-height: 140%;
  margin-top: 0;

  a {
    color: ${({ theme }) => theme.font.color.light};
    text-decoration: underline;

    &:hover {
      color: ${({ theme }) => theme.font.color.primary};
    }
  }
`;

const StyledInlineText = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1)};
  line-height: 140%;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  max-width: 450px;
`;
const StyledCopySetupKeyButton = styled.button`
  all: unset;
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  text-decoration: underline;
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: 0;

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledH2Title = styled(H2Title)`
  margin-top: 0 !important;
  margin-bottom: 8px !important;
  padding: 0 !important;
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
        title={t`Two-factor authentication`}
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

              <StyledH2Title title={t`Authenticator app`} />

              <StyledInstructions>
                <Trans>
                  Authenticator apps and browser extensions like{' '}
                  <a
                    href="https://1password.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    1Password
                  </a>
                  ,{' '}
                  <a
                    href="https://authy.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Authy
                  </a>
                  ,{' '}
                  <a
                    href="https://www.microsoft.com/en-us/security/mobile-authenticator-app"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Microsoft Authenticator
                  </a>{' '}
                  ,etc generate one-time passwords that are used as a second
                  factor to verify your identity when prompted during sign-in.
                </Trans>
              </StyledInstructions>

              <StyledQRCodeContainer>
                {!qrCode ? (
                  <Loader />
                ) : (
                    <QRCode value={qrCode} size={100} />
                )}
              </StyledQRCodeContainer>

              <StyledInlineText>
                <Trans>Can't scan? Copy the</Trans>
                <StyledCopySetupKeyButton onClick={handleCopySetupKey}>
                  <Trans>setup key</Trans>
                </StyledCopySetupKeyButton>
              </StyledInlineText>

              <H2Title title={t`Verify the code from the app`} />
              <StyledInstructions>
                <Trans>Copy paste the code below</Trans>
              </StyledInstructions>

              <TwoFactorAuthenticationVerificationForSettings />
            </Section>
          )}
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </FormProvider>
  );
};
