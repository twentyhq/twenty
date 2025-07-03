import { useRecoilValue } from 'recoil';

import { useAuth } from '@/auth/hooks/useAuth';
import { currentUserState } from '@/auth/states/currentUserState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useLingui } from '@lingui/react/macro';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { useDeleteUserAccountMutation } from '~/generated-metadata/graphql';

const DELETE_ACCOUNT_MODAL_ID = 'delete-account-modal';
export const DeleteAccount = () => {
  const { t } = useLingui();
  const { openModal } = useModal();

  const [deleteUserAccount] = useDeleteUserAccountMutation();
  const currentUser = useRecoilValue(currentUserState);
  const userEmail = currentUser?.email;
  const { signOut } = useAuth();

  const deleteAccount = async () => {
    await deleteUserAccount();
    await signOut();
  };

  return (
    <>
      <H2Title
        title={t`Danger zone`}
        description={t`Delete account and all the associated data`}
      />

      <Button
        accent="danger"
        onClick={() => openModal(DELETE_ACCOUNT_MODAL_ID)}
        variant="secondary"
        title={t`Delete account`}
      />

      <ConfirmationModal
        confirmationValue={userEmail}
        confirmationPlaceholder={userEmail ?? ''}
        modalId={DELETE_ACCOUNT_MODAL_ID}
        title={t`Account Deletion`}
        subtitle={
          <>
            This action cannot be undone. This will permanently delete your
            entire account. <br /> Please type in your email to confirm.
          </>
        }
        onConfirmClick={deleteAccount}
        confirmButtonText={t`Delete account`}
      />
    </>
  );
};
