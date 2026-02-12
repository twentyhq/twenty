import { useRecoilValue } from 'recoil';

import { useAuth } from '@/auth/hooks/useAuth';
import { currentUserState } from '@/auth/states/currentUserState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { Trans, useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { useDeleteTwoFactorAuthenticationMethodMutation } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { useCurrentUserWorkspaceTwoFactorAuthentication } from '@/settings/two-factor-authentication/hooks/useCurrentUserWorkspaceTwoFactorAuthentication';
import { useCurrentWorkspaceTwoFactorAuthenticationPolicy } from '@/settings/two-factor-authentication/hooks/useWorkspaceTwoFactorAuthenticationPolicy';

const DELETE_TWO_FACTOR_AUTHENTICATION_MODAL_ID =
  'delete-two-factor-authentication-modal';
export const DeleteTwoFactorAuthentication = () => {
  const { t } = useLingui();
  const { openModal } = useModal();

  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const { signOut } = useAuth();
  const { loadCurrentUser } = useLoadCurrentUser();
  const [deleteTwoFactorAuthenticationMethod] =
    useDeleteTwoFactorAuthenticationMethodMutation();
  const currentUser = useRecoilValue(currentUserState);
  const userEmail = currentUser?.email;
  const navigate = useNavigateSettings();
  const twoFactorAuthenticationStrategy =
    useParams().twoFactorAuthenticationStrategy;

  const { currentUserWorkspaceTwoFactorAuthenticationMethods } =
    useCurrentUserWorkspaceTwoFactorAuthentication();

  const { isEnforced: isTwoFactorAuthenticationEnforced } =
    useCurrentWorkspaceTwoFactorAuthenticationPolicy();

  const reset2FA = async () => {
    if (
      !isDefined(twoFactorAuthenticationStrategy) ||
      !isDefined(
        currentUserWorkspaceTwoFactorAuthenticationMethods[
          twoFactorAuthenticationStrategy
        ]?.twoFactorAuthenticationMethodId,
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
        twoFactorAuthenticationMethodId:
          currentUserWorkspaceTwoFactorAuthenticationMethods[
            twoFactorAuthenticationStrategy
          ].twoFactorAuthenticationMethodId,
      },
    });

    enqueueSuccessSnackBar({
      message: t`2FA Method has been deleted successfully.`,
      options: {
        dedupeKey: '2fa-dedupe-key',
      },
    });

    if (isTwoFactorAuthenticationEnforced === true) {
      await signOut();
    } else {
      navigate(SettingsPath.ProfilePage);
      await loadCurrentUser();
    }
  };

  return (
    <>
      <H2Title
        title={t`Delete Two-Factor Authentication Method`}
        description={t`Deleting this method will remove it permanently from your account.`}
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
          isTwoFactorAuthenticationEnforced ? (
            <Trans>
              This will permanently delete your two factor authentication
              method.
              <br />
              Since 2FA is mandatory in your workspace, you will be logged out
              after deletion and will be asked to configure it again upon login.{' '}
              <br />
              Please type in your email to confirm.
            </Trans>
          ) : (
            <Trans>
              This action cannot be undone. This will permanently reset your two
              factor authentication method. <br /> Please type in your email to
              confirm.
            </Trans>
          )
        }
        onConfirmClick={reset2FA}
        confirmButtonText={t`Reset 2FA`}
      />
    </>
  );
};
