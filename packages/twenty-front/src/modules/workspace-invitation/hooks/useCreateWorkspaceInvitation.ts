import {
  type SendInvitationsMutationVariables,
  useSendInvitationsMutation,
} from '~/generated-metadata/graphql';
import { workspaceInvitationsState } from '@/workspace-invitation/states/workspaceInvitationsStates';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useCreateWorkspaceInvitation = () => {
  const [sendInvitationsMutation] = useSendInvitationsMutation();

  const setWorkspaceInvitations = useSetAtomState(workspaceInvitationsState);

  const sendInvitation = async (emails: SendInvitationsMutationVariables) => {
    return await sendInvitationsMutation({
      variables: emails,
      onCompleted: (data) => {
        setWorkspaceInvitations((workspaceInvitations) => [
          ...workspaceInvitations,
          ...data.sendInvitations.result,
        ]);
      },
    });
  };

  return {
    sendInvitation,
  };
};
