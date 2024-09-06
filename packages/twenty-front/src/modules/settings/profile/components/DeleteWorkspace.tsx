import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { H2Title, IconTrash } from 'twenty-ui';

import { useAuth } from '@/auth/hooks/useAuth';
import { currentUserState } from '@/auth/states/currentUserState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useDeleteCurrentWorkspaceMutation } from '~/generated/graphql';
import { Button } from '@/ui/input/button/components/Button';
export const DeleteWorkspace = () => {
  const [isDeleteWorkSpaceModalOpen, setIsDeleteWorkSpaceModalOpen] =
    useState(false);

  const [deleteCurrentWorkspace] = useDeleteCurrentWorkspaceMutation();
  const currentUser = useRecoilValue(currentUserState);
  const userEmail = currentUser?.email;

  const { signOut } = useAuth();

  const deleteWorkspace = async () => {
    await deleteCurrentWorkspace();
    await signOut();
  };

  return (
    <>
      <H2Title title="Zona de Perigo" description="Excluir seu workspace inteiro" />
      <Button
        accent="danger"
        variant="secondary"
        title="Excluir workspace"
        Icon={IconTrash}
        onClick={() => setIsDeleteWorkSpaceModalOpen(true)}
      />

      <ConfirmationModal
        confirmationPlaceholder={userEmail}
        confirmationValue={userEmail}
        isOpen={isDeleteWorkSpaceModalOpen}
        setIsOpen={setIsDeleteWorkSpaceModalOpen}
        title="Exclusão de Workspace"
        subtitle={
          <>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente seu
            workspace inteiro. <br /> Por favor, digite seu email para confirmar.
          </>
        }
        onConfirmClick={deleteWorkspace}
        deleteButtonText="Excluir workspace"
      />
    </>
  );
};
