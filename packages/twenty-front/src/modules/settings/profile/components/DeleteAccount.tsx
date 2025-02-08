import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Button, H2Title } from 'twenty-ui';

import { useAuth } from '@/auth/hooks/useAuth';
import { currentUserState } from '@/auth/states/currentUserState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useLingui } from '@lingui/react/macro';
import { useDeleteUserAccountMutation } from '~/generated/graphql';

export const DeleteAccount = () => {
  const { t } = useLingui();
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);

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
        onClick={() => setIsDeleteAccountModalOpen(true)}
        variant="secondary"
        title={t`Delete account`}
      />

      <ConfirmationModal
        confirmationValue={userEmail}
        confirmationPlaceholder={userEmail ?? ''}
        isOpen={isDeleteAccountModalOpen}
        setIsOpen={setIsDeleteAccountModalOpen}
        title={t`Account Deletion`}
        subtitle={
          <>
            This action cannot be undone. This will permanently delete your
            entire account. <br /> Please type in your email to confirm.
          </>
        }
        onConfirmClick={deleteAccount}
        deleteButtonText={t`Delete account`}
      />
    </>
  );
};
