import { useSetRecoilState } from 'recoil';
import { useEffect } from 'react';
import { useAuth } from '@/auth/hooks/useAuth';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { AppPath } from '@/types/AppPath';
import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';
import { useOrigin } from '@/domain-manager/hooks/useOrigin';
import { getLoginToken } from '@/apollo/utils/getLoginToken';
import { qrCodeState } from '@/auth/states/qrCode';

export const TwoFactorAuthenticationSetupEffect = () => {
  const { initiateOtpProvisioning } = useAuth();
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
            message: t`Invalid session.`,
            options: {
              dedupeKey: 'invalid-session-dedupe-key',
            }
          });
          return navigate(AppPath.SignInUp);
        }

        const token = await readCaptchaToken();
        const initiateOTPProvisioningResult = await initiateOtpProvisioning({
          variables: {
            loginToken: loginToken,
            captchaToken: token,
            origin,
          },
        });

        if (
          !initiateOTPProvisioningResult.data?.initiateOTPProvisioning.uri
        ) return;

        setQrCodeState(
          initiateOTPProvisioningResult.data?.initiateOTPProvisioning.uri,
        );

        enqueueSuccessSnackBar({
          message: t`Two factor authentication provisioning initiated.`,
          options: {
            dedupeKey:
              'two-factor-authentication-provisioning-initiation-dedupe-key',
          }
        });
      } catch (error) {
        enqueueErrorSnackBar({
          message: t`Two factor authentication provisioning failed.`,
          options: {
            dedupeKey: 'two-factor-authentication-provisioning-initiation-failed',
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