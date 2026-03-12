import { currentUserState } from '@/auth/states/currentUserState';
import { qrCodeState } from '@/auth/states/qrCode';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { InitiateOtpProvisioningForAuthenticatedUserDocument } from '~/generated-metadata/graphql';

export const TwoFactorAuthenticationSetupForSettingsEffect = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [qrCode, setQrCode] = useAtomState(qrCodeState);
  const currentUser = useAtomStateValue(currentUserState);

  const { t } = useLingui();

  const [initiateOTPProvisioningForAuthenticatedUser] = useMutation(
    InitiateOtpProvisioningForAuthenticatedUserDocument,
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
