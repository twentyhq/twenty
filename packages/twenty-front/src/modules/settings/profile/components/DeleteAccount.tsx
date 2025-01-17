import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Button, H2Title } from 'twenty-ui';

import { useAuth } from '@/auth/hooks/useAuth';
import { currentUserState } from '@/auth/states/currentUserState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useDeleteUserAccountMutation } from '~/generated/graphql';

export const DeleteAccount = () => {
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);

  const [deleteUserAccount] = useDeleteUserAccountMutation();
  const currentUser = useRecoilValue(currentUserState);
  const userEmail = currentUser?.email;
  const { signOut } = useAuth();
  const { t } = useLingui();

  const deleteAccount = async () => {
    await deleteUserAccount();
    await signOut();
  };

  return (
    <>
      <H2Title
        title={t`Danger zone`}
        description={t`Delete account and all the associated data`}
      />

      <Button
        accent="danger"
        onClick={() => setIsDeleteAccountModalOpen(true)}
        variant="secondary"
        title={t`Delete account`}
      />

      <ConfirmationModal
        confirmationValue={userEmail}
        confirmationPlaceholder={userEmail ?? ''}
        isOpen={isDeleteAccountModalOpen}
        setIsOpen={setIsDeleteAccountModalOpen}
        title={t`Account Deletion`}
        subtitle={
          <Trans>
            This action cannot be undone. This will permanently delete your
            entire account. <br /> Please type in your email to confirm.
          </Trans>
        }
        onConfirmClick={deleteAccount}
        deleteButtonText={t`Delete account`}
      />
    </>
  );
};
