import { useSetRecoilState } from 'recoil';
import { useEffect } from 'react';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { AppPath } from '@/types/AppPath';
import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';
import { useOrigin } from '@/domain-manager/hooks/useOrigin';
import { getLoginToken } from '@/apollo/utils/getLoginToken';
import { qrCodeState } from '@/auth/states/qrCode';
import { useCurrentUserWorkspaceTwoFactorAuthentication } from '@/settings/two-factor-authentication/hooks/useCurrentUserWorkspaceTwoFactorAuthentication';

export const TwoFactorAuthenticationSetupEffect = () => {
  const { initiateCurrentUserWorkspaceOtpProvisioning } =
    useCurrentUserWorkspaceTwoFactorAuthentication();
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const navigate = useNavigateApp();
  const { readCaptchaToken } = useReadCaptchaToken();
  const { origin } = useOrigin();
  const loginToken = getLoginToken();
  const setQrCodeState = useSetRecoilState(qrCodeState);

  const { t } = useLingui();

  useEffect(() => {
    const handleTwoFactorAuthenticationProvisioningInitiation = async () => {
      try {
        if (!loginToken) {
          enqueueErrorSnackBar({
            message: t`Login token missing. Two Factor Authentication setup can not be initiated.`,
            options: {
              dedupeKey: 'invalid-session-dedupe-key',
            },
          });
          return navigate(AppPath.SignInUp);
        }

        const token = await readCaptchaToken();
        const initiateOTPProvisioningResult =
          await initiateCurrentUserWorkspaceOtpProvisioning({
            variables: {
              loginToken: loginToken,
              captchaToken: token,
              origin,
            },
          });

        if (!initiateOTPProvisioningResult.data?.initiateOTPProvisioning.uri)
          return;

        setQrCodeState(
          initiateOTPProvisioningResult.data?.initiateOTPProvisioning.uri,
        );

        enqueueSuccessSnackBar({
          message: t`Two factor authentication provisioning initiated.`,
          options: {
            dedupeKey:
              'two-factor-authentication-provisioning-initiation-dedupe-key',
          },
        });
      } catch (error) {
        enqueueErrorSnackBar({
          message: t`Two factor authentication provisioning failed.`,
          options: {
            dedupeKey:
              'two-factor-authentication-provisioning-initiation-failed',
          },
        });
      }
    };

    handleTwoFactorAuthenticationProvisioningInitiation();

    // Two factor authentication provisioning only needs to run once at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};
