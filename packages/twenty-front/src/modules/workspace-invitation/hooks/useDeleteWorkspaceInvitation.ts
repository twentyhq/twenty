import {
  type DeleteWorkspaceInvitationMutationVariables,
  useDeleteWorkspaceInvitationMutation,
} from '~/generated-metadata/graphql';
import { workspaceInvitationsState } from '@/workspace-invitation/states/workspaceInvitationsStates';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';

export const useDeleteWorkspaceInvitation = () => {
  const [deleteWorkspaceInvitationMutation] =
    useDeleteWorkspaceInvitationMutation();

  const setWorkspaceInvitations = useSetRecoilStateV2(
    workspaceInvitationsState,
  );

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
