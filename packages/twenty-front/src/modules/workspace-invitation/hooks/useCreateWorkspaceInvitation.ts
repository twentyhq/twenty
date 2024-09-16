import { useSendInvitationsMutation } from '~/generated/graphql';
import { useRecoilState } from 'recoil';
import { workspaceInvitationsState } from '../states/workspaceInvitationsStates';
import { SendInvitationsMutationVariables } from '../../../generated/graphql';

export const useCreateWorkspaceInvitation = () => {
  const [sendInvitationsMutation] = useSendInvitationsMutation();

  const [, setWorkspaceInvitations] = useRecoilState(workspaceInvitationsState);

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
