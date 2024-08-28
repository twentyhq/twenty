import {
  useSendInviteLinkMutation,
  SendInviteLinkMutationVariables,
} from '~/generated/graphql';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { workspaceInvitationsState } from '../states/workspaceInvitationsStates';

export const useInviteUser = () => {
  const [sendInviteLinkMutation] = useSendInviteLinkMutation();

  const setWorkspaceInvitations = useSetRecoilState(workspaceInvitationsState);
  const workspaceInvitations = useRecoilValue(workspaceInvitationsState);

  const sendInvitation = async (emails: SendInviteLinkMutationVariables) => {
    return await sendInviteLinkMutation({
      variables: emails,
      onCompleted: (data) => {
        setWorkspaceInvitations([
          ...workspaceInvitations,
          ...data.sendInviteLink.result,
        ]);
      },
    });
  };

  return {
    sendInvitation,
  };
};
