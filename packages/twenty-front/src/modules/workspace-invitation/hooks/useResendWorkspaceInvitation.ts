import { useMutation } from '@apollo/client/react';
import {
  type ResendWorkspaceInvitationMutationVariables,
  ResendWorkspaceInvitationDocument,
} from '~/generated-metadata/graphql';
import { workspaceInvitationsState } from '@/workspace-invitation/states/workspaceInvitationsStates';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useResendWorkspaceInvitation = () => {
  const [resendWorkspaceInvitationMutation] = useMutation(
    ResendWorkspaceInvitationDocument,
  );

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
