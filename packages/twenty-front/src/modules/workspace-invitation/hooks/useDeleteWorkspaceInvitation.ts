import {
  DeleteWorkspaceInvitationMutationVariables,
  useDeleteWorkspaceInvitationMutation,
} from '~/generated/graphql';
import { useRecoilState } from 'recoil';
import { workspaceInvitationsState } from '../states/workspaceInvitationsStates';

export const useDeleteWorkspaceInvitation = () => {
  const [deleteWorkspaceInvitationMutation] =
    useDeleteWorkspaceInvitationMutation();

  const [, setWorkspaceInvitations] = useRecoilState(workspaceInvitationsState);

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
