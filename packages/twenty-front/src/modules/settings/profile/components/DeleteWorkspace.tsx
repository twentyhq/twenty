import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Button, H2Title, IconTrash } from 'twenty-ui';

import { useAuth } from '@/auth/hooks/useAuth';
import { currentUserState } from '@/auth/states/currentUserState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useDeleteCurrentWorkspaceMutation } from '~/generated/graphql';

export const DeleteWorkspace = () => {
  const [isDeleteWorkSpaceModalOpen, setIsDeleteWorkSpaceModalOpen] =
    useState(false);

  const [deleteCurrentWorkspace] = useDeleteCurrentWorkspaceMutation();
  const currentUser = useRecoilValue(currentUserState);
  const userEmail = currentUser?.email;
  const { t } = useLingui();

  const { signOut } = useAuth();

  const deleteWorkspace = async () => {
    await deleteCurrentWorkspace();
    await signOut();
  };

  return (
    <>
      <H2Title
        title={t`Danger zone`}
        description={t`Delete your whole workspace`}
      />
      <Button
        accent="danger"
        variant="secondary"
        title={t`Delete workspace`}
        Icon={IconTrash}
        onClick={() => setIsDeleteWorkSpaceModalOpen(true)}
      />

      <ConfirmationModal
        confirmationPlaceholder={userEmail}
        confirmationValue={userEmail}
        isOpen={isDeleteWorkSpaceModalOpen}
        setIsOpen={setIsDeleteWorkSpaceModalOpen}
        title={t`Workspace Deletion`}
        subtitle={
          <Trans>
            This action cannot be undone. This will permanently delete your
            entire workspace. <br /> Please type in your email to confirm.
          </Trans>
        }
        onConfirmClick={deleteWorkspace}
        deleteButtonText={t`Delete workspace`}
      />
    </>
  );
};
