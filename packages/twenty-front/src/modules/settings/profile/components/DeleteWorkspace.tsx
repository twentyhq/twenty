import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Button, H2Title, IconTrash } from 'twenty-ui';

import { useAuth } from '@/auth/hooks/useAuth';
import { currentUserState } from '@/auth/states/currentUserState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useTranslation } from 'react-i18next';
import { useDeleteCurrentWorkspaceMutation } from '~/generated/graphql';
export const DeleteWorkspace = () => {
  const [isDeleteWorkSpaceModalOpen, setIsDeleteWorkSpaceModalOpen] =
    useState(false);

  const { t } = useTranslation();
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
      <H2Title title={t('dangerZone')} description={t('dangerZoneDescription')} />
      <Button
        accent="danger"
        variant="secondary"
        title={t('deleteWorkspace')}
        Icon={IconTrash}
        onClick={() => setIsDeleteWorkSpaceModalOpen(true)}
      />

      <ConfirmationModal
        confirmationPlaceholder={userEmail}
        confirmationValue={userEmail}
        isOpen={isDeleteWorkSpaceModalOpen}
        setIsOpen={setIsDeleteWorkSpaceModalOpen}
        title={t('deleteWorkspaceTitle')}
        subtitle={
          <>
            {t('deleteWorkspaceWarning')} <br /> {t('confirmEmail')}.
          </>
        }
        onConfirmClick={deleteWorkspace}
        deleteButtonText={t('deleteWorkspace')}
      />
    </>
  );
};
