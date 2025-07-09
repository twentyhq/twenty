import { useSetRecoilState } from 'recoil';
import { useEffect } from 'react';
import { useAuth } from '@/auth/hooks/useAuth';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { AppPath } from '@/types/AppPath';
import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';
import { useOrigin } from '@/domain-manager/hooks/useOrigin';
import { getLoginToken } from '@/apollo/utils/getLoginToken';
import { qrCodeState } from '@/auth/states/qrCode';

export const TwoFactorAuthenticationSetupEffect = () => {
  const { initiateTwoFactorAuthenticationProvisioning } = useAuth();

  const { enqueueSnackBar } = useSnackBar();

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
          enqueueSnackBar(t`Invalid email verification link.`, {
            dedupeKey: 'email-verification-link-dedupe-key',
            variant: SnackBarVariant.Error,
          });
          return navigate(AppPath.SignInUp);
        }

        const token = await readCaptchaToken();
        const ts = await initiateTwoFactorAuthenticationProvisioning({
          variables: {
            loginToken: loginToken,
            captchaToken: token,
            origin,
          },
        });

        if (!ts.data?.initiateOTPProvisioning.uri) return;

        setQrCodeState(
          ts.data?.initiateOTPProvisioning.uri,
        );

        enqueueSnackBar(t`Two factor authentication provisioning initiated.`, {
          dedupeKey:
            'two-factor-authentication-provisioning-initiation-dedupe-key',
          variant: SnackBarVariant.Success,
        });
      } catch (error) {
        // TODO: AAAAH
      }
    };

    handleTwoFactorAuthenticationProvisioningInitiation();

    // Two factor authentication provisioning only needs to run once at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};
