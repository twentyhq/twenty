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
import { TwoFactorAuthenticationVerificationForSettings } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationVerificationForSettings';
import { useCurrentUserWorkspaceTwoFactorAuthentication } from '@/settings/two-factor-authentication/hooks/useCurrentUserWorkspaceTwoFactorAuthentication';
import { useTwoFactorVerificationForSettings } from '@/settings/two-factor-authentication/hooks/useTwoFactorVerificationForSettings';
import { extractSecretFromOtpUri } from '@/settings/two-factor-authentication/utils/extractSecretFromOtpUri';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useTheme } from '@emotion/react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, IconCopy } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';
import { Section } from 'twenty-ui/layout';

const StyledQRCodeContainer = styled.div`
  margin: ${({ theme }) => theme.spacing(4)} 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledQRCodeWrapper = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledOTPContainer = styled.div`
  width: fit-content;
`;

const StyledQRCode = styled(QRCode)`
  height: 137px;
  width: 137px;
`;

const StyledCopySetupKeyText = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  text-align: left;
  line-height: 1.5;
`;

const StyledCopySetupKeyLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  display: inline;
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: 0;
  text-decoration: underline;
  margin-left: 0;

  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

const StyledDivider = styled.div`
  margin: ${({ theme }) => theme.spacing(6)} 0;
  width: 100%;
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
              <H2Title
                title={t`Authenticator app`}
                description={t`Authenticator apps and browser extensions like 1Password, Authy, Microsoft Authenticator, etc. generate one-time passwords that are used as a second factor to verify your identity when prompted during sign-in.`}
              />
              <StyledQRCodeContainer>
                {!qrCode ? (
                  <Loader />
                ) : (
                  <>
                    <StyledQRCodeWrapper>
                      <StyledQRCode value={qrCode} />
                    </StyledQRCodeWrapper>
                    <StyledCopySetupKeyText>
                      <Trans>Can't scan? Copy the</Trans>{' '}
                      <StyledCopySetupKeyLink onClick={handleCopySetupKey}>
                        <Trans>setup key</Trans>
                      </StyledCopySetupKeyLink>
                    </StyledCopySetupKeyText>
                  </>
                )}
              </StyledQRCodeContainer>

              <StyledDivider />

              <H2Title
                title={t`Verify the code from the app`}
                description={t`Copy paste the code below`}
              />
              <StyledOTPContainer>
                <TwoFactorAuthenticationVerificationForSettings />
              </StyledOTPContainer>
            </Section>
          )}
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </FormProvider>
  );
};
