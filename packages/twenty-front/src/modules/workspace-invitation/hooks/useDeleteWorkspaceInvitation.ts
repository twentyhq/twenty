import { useSetRecoilState } from 'recoil';
import {
  type DeleteWorkspaceInvitationMutationVariables,
  useDeleteWorkspaceInvitationMutation,
} from '~/generated-metadata/graphql';
import { workspaceInvitationsState } from '@/workspace-invitation/states/workspaceInvitationsStates';

export const useDeleteWorkspaceInvitation = () => {
  const [deleteWorkspaceInvitationMutation] =
    useDeleteWorkspaceInvitationMutation();

  const setWorkspaceInvitations = useSetRecoilState(workspaceInvitationsState);

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
