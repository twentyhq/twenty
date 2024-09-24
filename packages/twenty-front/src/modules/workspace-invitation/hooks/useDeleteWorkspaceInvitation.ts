import { useSetRecoilState } from 'recoil';
import {
  DeleteWorkspaceInvitationMutationVariables,
  useDeleteWorkspaceInvitationMutation,
} from '~/generated/graphql';
import { workspaceInvitationsState } from '../states/workspaceInvitationsStates';

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
