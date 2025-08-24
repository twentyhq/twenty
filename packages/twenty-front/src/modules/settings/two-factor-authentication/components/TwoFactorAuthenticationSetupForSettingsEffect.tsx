import { currentUserState } from '@/auth/states/currentUserState';
import { qrCodeState } from '@/auth/states/qrCode';
import { otpProvisioningInProgressState } from '@/settings/two-factor-authentication/states/otpProvisioningInProgress';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { gql, useMutation } from '@apollo/client';
import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

const INITIATE_OTP_PROVISIONING_FOR_AUTHENTICATED_USER = gql`
  mutation initiateOTPProvisioningForAuthenticatedUser {
    initiateOTPProvisioningForAuthenticatedUser {
      uri
    }
  }
`;

export const TwoFactorAuthenticationSetupForSettingsEffect = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const setQrCodeState = useSetRecoilState(qrCodeState);
  const { t } = useLingui();
  const [initiateOTPProvisioningForAuthenticatedUser] = useMutation(
    INITIATE_OTP_PROVISIONING_FOR_AUTHENTICATED_USER,
  );

  const maybeProvision = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const user = snapshot.getLoadable(currentUserState).getValue();
        if (!user) {
          return;
        }

        const inProgress = snapshot
          .getLoadable(otpProvisioningInProgressState)
          .getValue();
        const code = snapshot.getLoadable(qrCodeState).getValue();

        if (Boolean(inProgress) || Boolean(code)) {
          return;
        }

        set(otpProvisioningInProgressState, true);

        try {
          const res = await initiateOTPProvisioningForAuthenticatedUser();
          const uri =
            res.data?.initiateOTPProvisioningForAuthenticatedUser?.uri;

          if (!uri) throw new Error('No URI returned from OTP provisioning');

          set(qrCodeState, uri);
        } catch {
          enqueueErrorSnackBar({
            message: t`Two factor authentication provisioning failed.`,
            options: {
              dedupeKey:
                'two-factor-authentication-provisioning-initiation-failed',
            },
          });
        } finally {
          set(otpProvisioningInProgressState, false);
        }
      },
    [
      enqueueErrorSnackBar,
      initiateOTPProvisioningForAuthenticatedUser,
      setQrCodeState,
      t,
    ],
  );

  useEffect(() => {
    maybeProvision();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
