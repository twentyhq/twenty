import { useMutation } from '@apollo/client/react';
import {
  type SendInvitationsMutationVariables,
  SendInvitationsDocument,
} from '~/generated-metadata/graphql';
import { workspaceInvitationsState } from '@/workspace-invitation/states/workspaceInvitationsStates';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export const useCreateWorkspaceInvitation = () => {
  const [sendInvitationsMutation] = useMutation(SendInvitationsDocument);

  const setWorkspaceInvitations = useSetAtomState(workspaceInvitationsState);
  const { enqueueErrorSnackBar } = useSnackBar();

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
      onError: (error) => {
        enqueueErrorSnackBar({ apolloError: error });
      },
    });
  };

  return {
    sendInvitation,
  };
};
