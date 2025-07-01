import { useSetRecoilState } from 'recoil';
import {
  SendInvitationsMutationVariables,
  useSendInvitationsMutation,
} from '~/generated-metadata/graphql';
import { workspaceInvitationsState } from '../states/workspaceInvitationsStates';

export const useCreateWorkspaceInvitation = () => {
  const [sendInvitationsMutation] = useSendInvitationsMutation();

  const setWorkspaceInvitations = useSetRecoilState(workspaceInvitationsState);

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
