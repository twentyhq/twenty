import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';
import { AppPath } from '@/types/AppPath';
import { ButtonVariant } from '@/ui/button/components/Button';
import { SubSectionTitle } from '@/ui/title/components/SubSectionTitle';
import {
  useDeleteCurrentWorkspaceMutation,
  useDeleteUserAccountMutation,
} from '~/generated/graphql';

import { DeleteModal, StyledDeleteButton } from './DeleteModal';

export function DeleteWorkspace() {
  const [isDeleteWorkSpaceModalOpen, setIsDeleteWorkSpaceModalOpen] =
    useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);

  const [deleteCurrentWorkspace] = useDeleteCurrentWorkspaceMutation();
  const [deleteUserAccount] = useDeleteUserAccountMutation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    signOut();
    navigate(AppPath.SignIn);
  }, [signOut, navigate]);

  const deleteWorkspace = async () => {
    await deleteCurrentWorkspace();
    handleLogout();
  };

  const deleteAccount = async () => {
    await deleteUserAccount();
    handleLogout();
  };

  const subtitle = (
    type: 'workspace' | 'account',
  ) => `This action cannot be undone. This will permanently delete your
  entire ${type}. Please type in your email to confirm.`;

  return (
    <>
      <SubSectionTitle
        title="Danger zone"
        description="Delete your whole workspace"
      />
      <StyledDeleteButton
        onClick={() => setIsDeleteWorkSpaceModalOpen(true)}
        variant={ButtonVariant.Secondary}
        title="Delete workspace"
      />

      <SubSectionTitle
        title=""
        description="Delete account and all the associated data"
      />
      <StyledDeleteButton
        onClick={() => setIsDeleteAccountModalOpen(true)}
        variant={ButtonVariant.Secondary}
        title="Delete account"
      />

      <DeleteModal
        isOpen={isDeleteWorkSpaceModalOpen}
        setIsOpen={setIsDeleteWorkSpaceModalOpen}
        title="Workspace Deletion"
        subtitle={subtitle('workspace')}
        handleConfirmDelete={deleteWorkspace}
        deleteButtonText="Delete workspace"
      />

      <DeleteModal
        isOpen={isDeleteAccountModalOpen}
        setIsOpen={setIsDeleteAccountModalOpen}
        title="Account Deletion"
        subtitle={subtitle('account')}
        handleConfirmDelete={deleteAccount}
        deleteButtonText="Delete account"
      />
    </>
  );
}
