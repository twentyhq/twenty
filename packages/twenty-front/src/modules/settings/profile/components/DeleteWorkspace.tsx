import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { useSignOutAndRedirect } from '@/auth/hooks/useSignOutAndRedirect';
import { currentUserState } from '@/auth/states/currentUserState';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import {
  ConfirmationModal,
  StyledConfirmationButton,
} from '@/ui/layout/modal/components/ConfirmationModal';
import { useDeleteCurrentWorkspaceMutation } from '~/generated/graphql';

export const DeleteWorkspace = () => {
  const [isDeleteWorkSpaceModalOpen, setIsDeleteWorkSpaceModalOpen] =
    useState(false);

  const [deleteCurrentWorkspace] = useDeleteCurrentWorkspaceMutation();
  const currentUser = useRecoilValue(currentUserState);
  const userEmail = currentUser?.email;

  const handleLogout = useSignOutAndRedirect();

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
