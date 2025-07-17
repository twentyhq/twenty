import { useRecoilValue } from 'recoil';

import { useAuth } from '@/auth/hooks/useAuth';
import { currentUserState } from '@/auth/states/currentUserState';
import { useOrigin } from '@/domain-manager/hooks/useOrigin';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { useResetTwoFactorAuthenticationMethodMutation } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { useTwoFactorAuthentication } from '../hooks/useTwoFactorAuthentication';

const DELETE_TWO_FACTOR_AUTHENTICATION_MODAL_ID =
  'delete-two-factor-authentication-modal';
export const DeleteTwoFactorAuthentication = () => {
  const { t } = useLingui();
  const { openModal } = useModal();

  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const { origin } = useOrigin();
  const [deleteTwoFactorAuthenticationMethod] =
    useResetTwoFactorAuthenticationMethodMutation();
  const currentUser = useRecoilValue(currentUserState);
  const userEmail = currentUser?.email;
  const { signOut } = useAuth();
  const navigate = useNavigateSettings();

  const { defaultTwoFactorAuthenticationMethod } = useTwoFactorAuthentication();

  const reset2FA = async () => {
    if (
      !isDefined(
        defaultTwoFactorAuthenticationMethod.twoFactorAuthenticationMethodId,
      )
    ) {
      enqueueErrorSnackBar({
        message: t`Invalid 2FA information.`,
        options: {
          dedupeKey: '2fa-dedupe-key',
        },
      });
      return navigate(SettingsPath.ProfilePage);
    }

    await deleteTwoFactorAuthenticationMethod({
      variables: {
        origin,
        twoFactorAuthenticationMethodId:
          defaultTwoFactorAuthenticationMethod.twoFactorAuthenticationMethodId,
      },
    });

    enqueueSuccessSnackBar({
      message: t`2FA Method has been reset successfuly.`,
      options: {
        dedupeKey: '2fa-dedupe-key',
      },
    });

    await signOut();
  };

  return (
    <>
      <H2Title
        title={t`Reset Two-Factor Authentication Method`}
        description={t`After resetting you will be asked to configure it again.`}
      />

      <Button
        accent="danger"
        onClick={() => openModal(DELETE_TWO_FACTOR_AUTHENTICATION_MODAL_ID)}
        variant="secondary"
        title={t`Reset 2FA`}
      />

      <ConfirmationModal
        confirmationValue={userEmail}
        confirmationPlaceholder={userEmail ?? ''}
        modalId={DELETE_TWO_FACTOR_AUTHENTICATION_MODAL_ID}
        title={t`2FA Method Reset`}
        subtitle={
          <>
            This action cannot be undone. This will permanently reset your two
            factor authentication method. <br /> Please type in your email to
            confirm.
          </>
        }
        onConfirmClick={reset2FA}
        confirmButtonText={t`Reset 2FA`}
      />
    </>
  );
};
