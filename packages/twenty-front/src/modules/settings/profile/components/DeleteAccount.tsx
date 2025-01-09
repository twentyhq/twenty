import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Button, H2Title } from 'twenty-ui';

import { useAuth } from '@/auth/hooks/useAuth';
import { currentUserState } from '@/auth/states/currentUserState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useTranslation } from 'react-i18next';
import { useDeleteUserAccountMutation } from '~/generated/graphql';

export const DeleteAccount = () => {
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);

  const [deleteUserAccount] = useDeleteUserAccountMutation();
  const currentUser = useRecoilValue(currentUserState);
  const userEmail = currentUser?.email;
  const { signOut } = useAuth();

  const { t } = useTranslation();
  
  const deleteAccount = async () => {
    await deleteUserAccount();
    await signOut();
  };

  return (
    <>
      <H2Title
        title={t('dangerZone')}
        description={t('dangerZoneProfileDescription')}
      />

      <Button
        accent="danger"
        onClick={() => setIsDeleteAccountModalOpen(true)}
        variant="secondary"
        title={t('deleteAccountButtonText')}
      />

      <ConfirmationModal
        confirmationValue={userEmail}
        confirmationPlaceholder={userEmail ?? ''}
        isOpen={isDeleteAccountModalOpen}
        setIsOpen={setIsDeleteAccountModalOpen}
        title={t('deleteAccountTitle')}
        subtitle={
          <>
            {t('deleteAccountWarning')} <br /> {t('confirmEmail')}
          </>
        }
        onConfirmClick={deleteAccount}
        deleteButtonText={t('deleteAccountButtonText')}
      />
    </>
  );
};
