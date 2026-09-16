import { Trans, useLingui } from '@lingui/react/macro';

import { useAuth } from '@/auth/hooks/useAuth';
import { currentUserState } from '@/auth/states/currentUserState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useRedirectToDefaultDomain } from '@/domain-manager/hooks/useRedirectToDefaultDomain';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { Section } from 'twenty-ui/components';
import { IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { useMutation } from '@apollo/client/react';
import { AppPath } from 'twenty-shared/types';
import { DeleteCurrentWorkspaceDocument } from '~/generated-metadata/graphql';

const DELETE_WORKSPACE_MODAL_ID = 'delete-workspace-modal';

export const DeleteWorkspace = () => {
  const [deleteCurrentWorkspace] = useMutation(DeleteCurrentWorkspaceDocument);
  const currentUser = useAtomStateValue(currentUserState);
  const userEmail = currentUser?.email;
  const { t } = useLingui();
  const { openModal } = useModal();

  const { signOut } = useAuth();
  const { redirectToDefaultDomain } = useRedirectToDefaultDomain();

  const deleteWorkspace = async () => {
    await deleteCurrentWorkspace();
    await signOut();
    redirectToDefaultDomain({ pathname: AppPath.SignInUp });
  };

  return (
    <>
      <Section.Header
        title={t`Danger zone`}
        description={t`Delete your whole workspace`}
      />
      <Button
        startIcon={<IconTrash />}
        onClick={() => openModal(DELETE_WORKSPACE_MODAL_ID)}
        variant="outline"
        color="danger"
      >{t`Delete workspace`}</Button>

      <ConfirmationModal
        modalInstanceId={DELETE_WORKSPACE_MODAL_ID}
        confirmationPlaceholder={userEmail}
        confirmationValue={userEmail}
        title={t`Workspace Deletion`}
        subtitle={
          <Trans>
            This action cannot be undone. This will permanently delete your
            entire workspace. <br /> Please type in your email to confirm.
          </Trans>
        }
        onConfirmClick={deleteWorkspace}
        confirmButtonText={t`Delete workspace`}
      />
    </>
  );
};
