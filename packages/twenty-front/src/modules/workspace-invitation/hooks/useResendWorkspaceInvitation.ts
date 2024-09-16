import {
  useResendWorkspaceInvitationMutation,
  ResendWorkspaceInvitationMutationVariables,
} from '~/generated/graphql';
import { useRecoilState } from 'recoil';
import { workspaceInvitationsState } from '../states/workspaceInvitationsStates';

export const useResendWorkspaceInvitation = () => {
  const [resendWorkspaceInvitationMutation] =
    useResendWorkspaceInvitationMutation();

  const [, setWorkspaceInvitations] = useRecoilState(workspaceInvitationsState);

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
