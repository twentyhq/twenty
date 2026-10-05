import { loginTokenState } from '@/auth/states/loginTokenState';
import { qrCodeState } from '@/auth/states/qrCode';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { getTwoFactorAuthenticationErrorToastOptions } from '@/auth/utils/getTwoFactorAuthenticationErrorToastOptions';
import { useOrigin } from '@/domain-manager/hooks/useOrigin';
import { useCurrentUserWorkspaceTwoFactorAuthentication } from '@/settings/two-factor-authentication/hooks/useCurrentUserWorkspaceTwoFactorAuthentication';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

export const TwoFactorAuthenticationSetupEffect = () => {
  const { initiateCurrentUserWorkspaceOtpProvisioning } =
    useCurrentUserWorkspaceTwoFactorAuthentication();
  const { enqueueToast } = useToast();

  const navigate = useNavigateApp();
  const { origin } = useOrigin();
  const loginToken = useAtomStateValue(loginTokenState);
  const qrCode = useAtomStateValue(qrCodeState);
  const setQrCode = useSetAtomState(qrCodeState);
  const setSignInUpStep = useSetAtomState(signInUpStepState);

  const { t } = useLingui();

  useEffect(() => {
    if (isDefined(qrCode)) {
      return;
    }

    const handleTwoFactorAuthenticationProvisioningInitiation = async () => {
      try {
        if (!loginToken) {
          enqueueToast({
            variant: 'error',
            children: t`Login token missing. Two Factor Authentication setup can not be initiated.`,
            dedupeKey: 'invalid-session-dedupe-key',
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

        setQrCode(
          initiateOTPProvisioningResult.data?.initiateOTPProvisioning.uri,
        );
      } catch (error) {
        if (isGraphqlErrorOfType(error, 'RECOVERY_ENROLLMENT_RESTRICTED')) {
          setSignInUpStep(SignInUpStep.TwoFactorAuthenticationRecovery);
        }

        enqueueToast(
          getTwoFactorAuthenticationErrorToastOptions({
            error,
            fallbackMessage: t`Two factor authentication provisioning failed.`,
            dedupeKey:
              'two-factor-authentication-provisioning-initiation-failed',
          }),
        );
      }
    };

    handleTwoFactorAuthenticationProvisioningInitiation();

    // Two factor authentication provisioning only needs to run once at mount
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};
