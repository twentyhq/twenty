import { useSetRecoilState } from 'recoil';
import {
  SendInvitationsMutationVariables,
  useSendInvitationsMutation,
} from '~/generated/graphql';
import { workspaceInvitationsState } from '../states/workspaceInvitationsStates';

export const useCreateWorkspaceInvitation = () => {
  const [sendInvitationsMutation] = useSendInvitationsMutation();

  const setWorkspaceInvitations = useSetRecoilState(workspaceInvitationsState);

  const sendInvitation = async (params: SendInvitationsMutationVariables) => {
    return await sendInvitationsMutation({
      variables: params,
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
