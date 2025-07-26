import { qrCodeState } from '@/auth/states/qrCode';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { gql, useMutation } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

const INITIATE_OTP_PROVISIONING_FOR_AUTHENTICATED_USER = gql`
  mutation initiateOTPProvisioningForAuthenticatedUser {
    initiateOTPProvisioningForAuthenticatedUser {
      uri
    }
  }
`;

export const TwoFactorAuthenticationSetupForSettingsEffect = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const qrCode = useRecoilValue(qrCodeState);
  const setQrCodeState = useSetRecoilState(qrCodeState);
  const { t } = useLingui();

  const [initiateOTPProvisioningForAuthenticatedUser] = useMutation(
    INITIATE_OTP_PROVISIONING_FOR_AUTHENTICATED_USER,
  );

  useEffect(() => {
    if (isDefined(qrCode)) {
      return;
    }

    const handleTwoFactorAuthenticationProvisioningInitiation = async () => {
      try {
        const initiateOTPProvisioningResult =
          await initiateOTPProvisioningForAuthenticatedUser();

        if (
          !initiateOTPProvisioningResult.data
            ?.initiateOTPProvisioningForAuthenticatedUser.uri
        ) {
          throw new Error('No URI returned from OTP provisioning');
        }

        setQrCodeState(
          initiateOTPProvisioningResult.data
            .initiateOTPProvisioningForAuthenticatedUser.uri,
        );
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
