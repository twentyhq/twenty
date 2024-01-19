import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { useAuth } from '@/auth/hooks/useAuth';
import { currentUserState } from '@/auth/states/currentUserState';
import { AppPath } from '@/types/AppPath';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import useI18n from '@/ui/i18n/useI18n';
import { Button } from '@/ui/input/button/components/Button';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useDeleteUserAccountMutation } from '~/generated/graphql';

export const DeleteAccount = () => {
  const { translate } = useI18n('translations');
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);

  const [deleteUserAccount] = useDeleteUserAccountMutation();
  const currentUser = useRecoilValue(currentUserState);
  const userEmail = currentUser?.email;
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
      <H2Title
        title={translate('dangerZone')}
        description={translate('deleteAccountAndAllAssociatedData')}
      />

      <Button
        accent="danger"
        onClick={() => setIsDeleteAccountModalOpen(true)}
        variant="secondary"
        title={translate('deleteAccount')}
      />

      <ConfirmationModal
        confirmationValue={userEmail}
        confirmationPlaceholder={userEmail ?? ''}
        isOpen={isDeleteAccountModalOpen}
        setIsOpen={setIsDeleteAccountModalOpen}
        title={translate('accountDeletion')}
        subtitle={
          <>
            {translate('accountDeletionDsc')} <br />
            {translate('pleaseTypeYourEmailConfirm')}
          </>
        }
        onConfirmClick={deleteAccount}
        deleteButtonText={translate('deleteAccount')}
      />
    </>
  );
};
