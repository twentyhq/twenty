import {
  type DeleteWorkspaceInvitationMutationVariables,
  useDeleteWorkspaceInvitationMutation,
} from '~/generated-metadata/graphql';
import { workspaceInvitationsState } from '@/workspace-invitation/states/workspaceInvitationsStates';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useDeleteWorkspaceInvitation = () => {
  const [deleteWorkspaceInvitationMutation] =
    useDeleteWorkspaceInvitationMutation();

  const setWorkspaceInvitations = useSetAtomState(workspaceInvitationsState);

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
    });
  };

  return {
    deleteWorkspaceInvitation,
  };
};
