import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';

import { useAuth } from '@/auth/hooks/useAuth';
import { currentUserState } from '@/auth/states/currentUserState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { H2Title, IconTrash } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { useDeleteCurrentWorkspaceMutation } from '~/generated-metadata/graphql';

const DELETE_WORKSPACE_MODAL_ID = 'delete-workspace-modal';

export const DeleteWorkspace = () => {
  const [deleteCurrentWorkspace] = useDeleteCurrentWorkspaceMutation();
  const currentUser = useRecoilValue(currentUserState);
  const userEmail = currentUser?.email;
  const { t } = useLingui();
  const { openModal } = useModal();

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
        onClick={() => openModal(DELETE_WORKSPACE_MODAL_ID)}
      />

      <ConfirmationModal
        modalId={DELETE_WORKSPACE_MODAL_ID}
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
