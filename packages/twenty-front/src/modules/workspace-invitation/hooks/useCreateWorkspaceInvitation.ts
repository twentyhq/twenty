import {
  type SendInvitationsMutationVariables,
  useSendInvitationsMutation,
} from '~/generated-metadata/graphql';
import { workspaceInvitationsState } from '@/workspace-invitation/states/workspaceInvitationsStates';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';

export const useCreateWorkspaceInvitation = () => {
  const [sendInvitationsMutation] = useSendInvitationsMutation();

  const setWorkspaceInvitations = useSetRecoilStateV2(
    workspaceInvitationsState,
  );

  const sendInvitation = async (
    variables: SendInvitationsMutationVariables,
  ) => {
    return await sendInvitationsMutation({
      variables,
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
