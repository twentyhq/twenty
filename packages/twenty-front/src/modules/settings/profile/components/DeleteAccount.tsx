import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { useSignOutAndRedirect } from '@/auth/hooks/useSignOutAndRedirect';
import { currentUserState } from '@/auth/states/currentUserState';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Button } from '@/ui/input/button/components/Button';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useDeleteUserAccountMutation } from '~/generated/graphql';

export const DeleteAccount = () => {
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);

  const [deleteUserAccount] = useDeleteUserAccountMutation();
  const currentUser = useRecoilValue(currentUserState);
  const userEmail = currentUser?.email;
  const handleLogout = useSignOutAndRedirect();

  const deleteAccount = async () => {
    await deleteUserAccount();
    handleLogout();
  };

  return (
    <>
      <H2Title
        title="Danger zone"
        description="Delete account and all the associated data"
      />

      <Button
        accent="danger"
        onClick={() => setIsDeleteAccountModalOpen(true)}
        variant="secondary"
        title="Delete account"
      />

      <ConfirmationModal
        confirmationValue={userEmail}
        confirmationPlaceholder={userEmail ?? ''}
        isOpen={isDeleteAccountModalOpen}
        setIsOpen={setIsDeleteAccountModalOpen}
        title="Account Deletion"
        subtitle={
          <>
            This action cannot be undone. This will permanently delete your
            entire account. <br /> Please type in your email to confirm.
          </>
        }
        onConfirmClick={deleteAccount}
        deleteButtonText="Delete account"
      />
    </>
  );
};
