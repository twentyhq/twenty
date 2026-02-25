import {
  type ResendWorkspaceInvitationMutationVariables,
  useResendWorkspaceInvitationMutation,
} from '~/generated-metadata/graphql';
import { workspaceInvitationsState } from '@/workspace-invitation/states/workspaceInvitationsStates';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useResendWorkspaceInvitation = () => {
  const [resendWorkspaceInvitationMutation] =
    useResendWorkspaceInvitationMutation();

  const setWorkspaceInvitations = useSetAtomState(workspaceInvitationsState);

  const resendInvitation = async ({
    appTokenId,
  }: ResendWorkspaceInvitationMutationVariables) => {
    return await resendWorkspaceInvitationMutation({
      variables: {
        appTokenId,
      },
      onCompleted: (data) => {
        setWorkspaceInvitations((workspaceInvitations) => [
          ...data.resendWorkspaceInvitation.result,
          ...workspaceInvitations.filter(
            (workspaceInvitation) => workspaceInvitation.id !== appTokenId,
          ),
        ]);
      },
    });
  };

  return {
    resendInvitation,
  };
};
