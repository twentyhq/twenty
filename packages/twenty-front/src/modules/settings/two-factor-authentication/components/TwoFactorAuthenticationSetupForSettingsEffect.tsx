import { currentUserState } from '@/auth/states/currentUserState';
import { qrCodeState } from '@/auth/states/qrCode';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { gql, useMutation } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
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
  const [qrCode, setQrCode] = useRecoilState(qrCodeState);
  const currentUser = useRecoilValue(currentUserState);

  const { t } = useLingui();

  const [initiateOTPProvisioningForAuthenticatedUser] = useMutation(
    INITIATE_OTP_PROVISIONING_FOR_AUTHENTICATED_USER,
  );

  useEffect(() => {
    if (!isDefined(currentUser) || isDefined(qrCode)) {
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

        setQrCode(
          initiateOTPProvisioningResult.data
            .initiateOTPProvisioningForAuthenticatedUser.uri,
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
  }, [
    enqueueErrorSnackBar,
    initiateOTPProvisioningForAuthenticatedUser,
    t,
    setQrCode,
    qrCode,
    currentUser,
  ]);

  return <></>;
};
