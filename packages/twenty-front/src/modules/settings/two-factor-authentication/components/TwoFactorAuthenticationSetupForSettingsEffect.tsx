import { currentUserState } from '@/auth/states/currentUserState';
import { qrCodeState } from '@/auth/states/qrCode';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';
import { InitiateOtpProvisioningForAuthenticatedUserDocument } from '~/generated-metadata/graphql';

export const TwoFactorAuthenticationSetupForSettingsEffect = () => {
  const { add: addToast } = useToast();
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
        addToast({
          variant: 'error',
          children: t`Two factor authentication provisioning failed.`,
          dedupeKey: 'two-factor-authentication-provisioning-initiation-failed',
        });
      }
    };

    handleTwoFactorAuthenticationProvisioningInitiation();
  }, [
    addToast,
    initiateOTPProvisioningForAuthenticatedUser,
    t,
    setQrCode,
    qrCode,
    currentUser,
  ]);

  return <></>;
};
