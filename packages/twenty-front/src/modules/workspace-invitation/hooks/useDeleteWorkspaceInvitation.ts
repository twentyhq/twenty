import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import {
  type DeleteWorkspaceInvitationMutationVariables,
  DeleteWorkspaceInvitationDocument,
} from '~/generated-metadata/graphql';
import { workspaceInvitationsState } from '@/workspace-invitation/states/workspaceInvitationsStates';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export const useDeleteWorkspaceInvitation = () => {
  const [deleteWorkspaceInvitationMutation] = useMutation(
    DeleteWorkspaceInvitationDocument,
  );

  const setWorkspaceInvitations = useSetAtomState(workspaceInvitationsState);
  const { enqueueErrorSnackBar } = useSnackBar();

  const deleteWorkspaceInvitation = async ({
    appTokenId,
  }: DeleteWorkspaceInvitationMutationVariables) => {
    return await deleteWorkspaceInvitationMutation({
      variables: {
        appTokenId,
      },
      onCompleted: () => {
        setWorkspaceInvitations((workspaceInvitations) =>
          workspaceInvitations.filter(
            (workspaceInvitation) => workspaceInvitation.id !== appTokenId,
          ),
        );
      },
      onError: (error) => {
        enqueueErrorSnackBar({
          apolloError: error,
          message: t`Failed to delete invitation`,
        });
      },
    });
  };

  return {
    deleteWorkspaceInvitation,
  };
};
