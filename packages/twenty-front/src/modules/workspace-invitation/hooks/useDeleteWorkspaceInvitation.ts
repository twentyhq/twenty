import { useErrorToast } from '@/error-handler/hooks/useErrorToast';
import { useMutation } from '@apollo/client/react';
import {
  type DeleteWorkspaceInvitationMutationVariables,
  DeleteWorkspaceInvitationDocument,
  GetWorkspaceInvitationsDocument,
} from '~/generated-metadata/graphql';

export const useDeleteWorkspaceInvitation = () => {
  const [deleteWorkspaceInvitationMutation] = useMutation(
    DeleteWorkspaceInvitationDocument,
  );

  const { enqueueErrorToast } = useErrorToast();

  const deleteWorkspaceInvitation = async ({
    appTokenId,
  }: DeleteWorkspaceInvitationMutationVariables) => {
    return await deleteWorkspaceInvitationMutation({
      variables: {
        appTokenId,
      },
      refetchQueries: [GetWorkspaceInvitationsDocument],
      onError: (error) => {
        enqueueErrorToast(error);
      },
    });
  };

  return {
    deleteWorkspaceInvitation,
  };
};
