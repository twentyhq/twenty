import { currentUserState } from '@/auth/states/currentUserState';
import { qrCodeState } from '@/auth/states/qrCode';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { gql, useMutation } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useRef } from 'react';
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
  const currentUser = useRecoilValue(currentUserState); 
  const { t } = useLingui();

  const [initiateOTPProvisioningForAuthenticatedUser] = useMutation(
    INITIATE_OTP_PROVISIONING_FOR_AUTHENTICATED_USER,
  );

  const hasInitiatedRef = useRef(false);

  useEffect(() => {
    if (!currentUser) return;

    if (hasInitiatedRef.current || isDefined(qrCode)) return;

    hasInitiatedRef.current = true;

    const handleProvisioning = async () => {
      try {
        const res = await initiateOTPProvisioningForAuthenticatedUser();
        const uri = res.data?.initiateOTPProvisioningForAuthenticatedUser?.uri;

        if (!uri) throw new Error('No URI returned from OTP provisioning');

        setQrCodeState(uri);
      } catch {
        enqueueErrorSnackBar({
          message: t`Two factor authentication provisioning failed.`,
          options: {
            dedupeKey: 'two-factor-authentication-provisioning-initiation-failed',
          },
        });
      }
    };

    handleProvisioning();
  }, [currentUser, qrCode, setQrCodeState, enqueueErrorSnackBar, t]);

  return null;
};
