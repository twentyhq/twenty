import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { useAuth } from '@/auth/hooks/useAuth';
import { currentUserState } from '@/auth/states/currentUserState';
import { AppPath } from '@/types/AppPath';
import {
  ConfirmationModal,
  StyledConfirmationButton,
} from '@/ui/modal/components/ConfirmationModal';
import { H2Title } from '@/ui/typography/components/H2Title';
import { useDeleteCurrentWorkspaceMutation } from '~/generated/graphql';

export const DeleteWorkspace = () => {
  const [isDeleteWorkSpaceModalOpen, setIsDeleteWorkSpaceModalOpen] =
    useState(false);

  const [deleteCurrentWorkspace] = useDeleteCurrentWorkspaceMutation();
  const currentUser = useRecoilValue(currentUserState);
  const userEmail = currentUser?.email;
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

  return (
    <>
      <H2Title title="Danger zone" description="Delete your whole workspace" />
      <StyledConfirmationButton
        onClick={() => setIsDeleteWorkSpaceModalOpen(true)}
        variant="secondary"
        title="Delete workspace"
      />

      <ConfirmationModal
        confirmationPlaceholder={userEmail}
        confirmationValue={userEmail}
        isOpen={isDeleteWorkSpaceModalOpen}
        setIsOpen={setIsDeleteWorkSpaceModalOpen}
        title="Workspace Deletion"
        subtitle={
          <>
            This action cannot be undone. This will permanently delete your
            entire workspace. <br /> Please type in your email to confirm.
          </>
        }
        onConfirmClick={deleteWorkspace}
        deleteButtonText="Delete workspace"
      />
    </>
  );
};
