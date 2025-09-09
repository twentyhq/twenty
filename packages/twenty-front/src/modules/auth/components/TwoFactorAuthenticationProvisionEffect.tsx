import { loginTokenState } from '@/auth/states/loginTokenState';
import { qrCodeState } from '@/auth/states/qrCode';
import { useOrigin } from '@/domain-manager/hooks/useOrigin';
import { useCurrentUserWorkspaceTwoFactorAuthentication } from '@/settings/two-factor-authentication/hooks/useCurrentUserWorkspaceTwoFactorAuthentication';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const TwoFactorAuthenticationSetupEffect = () => {
  const { initiateCurrentUserWorkspaceOtpProvisioning } =
    useCurrentUserWorkspaceTwoFactorAuthentication();
  const { enqueueErrorSnackBar } = useSnackBar();

  const navigate = useNavigateApp();
  const { origin } = useOrigin();
  const loginToken = useRecoilValue(loginTokenState);
  const qrCode = useRecoilValue(qrCodeState);
  const setQrCodeState = useSetRecoilState(qrCodeState);

  const { t } = useLingui();

  useEffect(() => {
    if (isDefined(qrCode)) {
      return;
    }

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

        const initiateOTPProvisioningResult =
          await initiateCurrentUserWorkspaceOtpProvisioning({
            variables: {
              loginToken: loginToken,
              origin,
            },
          });

        if (!initiateOTPProvisioningResult.data?.initiateOTPProvisioning.uri)
          return;

        setQrCodeState(
          initiateOTPProvisioningResult.data?.initiateOTPProvisioning.uri,
        );
      } catch {
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
