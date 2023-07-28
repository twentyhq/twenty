import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';
import { AppPath } from '@/types/AppPath';
import { ButtonVariant } from '@/ui/button/components/Button';
import { SubSectionTitle } from '@/ui/title/components/SubSectionTitle';
import { useDeleteUserAccountMutation } from '~/generated/graphql';

import { DeleteModal, StyledDeleteButton } from './DeleteModal';

export function DeleteAccount() {
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);

  const [deleteUserAccount] = useDeleteUserAccountMutation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    signOut();
    navigate(AppPath.SignIn);
  }, [signOut, navigate]);

  const deleteAccount = async () => {
    await deleteUserAccount();
    handleLogout();
  };

  return (
    <>
      <SubSectionTitle
        title="Danger zone"
        description="Delete account and all the associated data"
      />

      <StyledDeleteButton
        onClick={() => setIsDeleteAccountModalOpen(true)}
        variant={ButtonVariant.Secondary}
        title="Delete account"
      />

      <DeleteModal
        isOpen={isDeleteAccountModalOpen}
        setIsOpen={setIsDeleteAccountModalOpen}
        title="Account Deletion"
        subtitle={
          <>
            This action cannot be undone. This will permanently delete your
            entire account. <br /> Please type in your email to confirm.
          </>
        }
        handleConfirmDelete={deleteAccount}
        deleteButtonText="Delete account"
      />
    </>
  );
}
