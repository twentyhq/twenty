import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { useAuth } from '@/auth/hooks/useAuth';
import { currentUserState } from '@/auth/states/currentUserState';
import { AppPath } from '@/types/AppPath';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import useI18n from '@/ui/i18n/useI18n';
import {
  ConfirmationModal,
  StyledConfirmationButton,
} from '@/ui/layout/modal/components/ConfirmationModal';
import { useDeleteCurrentWorkspaceMutation } from '~/generated/graphql';

export const DeleteWorkspace = () => {
  const [isDeleteWorkSpaceModalOpen, setIsDeleteWorkSpaceModalOpen] =
    useState(false);
  const { translate } = useI18n('translations');
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
      <H2Title
        title={translate('dangerZone')}
        description={translate('deleteYourWholeWorkspace')}
      />
      <StyledConfirmationButton
        onClick={() => setIsDeleteWorkSpaceModalOpen(true)}
        variant="secondary"
        title={translate('deleteWorkspace')}
      />

      <ConfirmationModal
        confirmationPlaceholder={userEmail}
        confirmationValue={userEmail}
        isOpen={isDeleteWorkSpaceModalOpen}
        setIsOpen={setIsDeleteWorkSpaceModalOpen}
        title={translate('workspaceDeletion')}
        subtitle={
          <>
            {translate('workspaceDeletionDes')} <br />
            {translate('pleaseTypeYourEmailConfirm')}
          </>
        }
        onConfirmClick={deleteWorkspace}
        deleteButtonText={translate('deleteWorkspace')}
      />
    </>
  );
};
