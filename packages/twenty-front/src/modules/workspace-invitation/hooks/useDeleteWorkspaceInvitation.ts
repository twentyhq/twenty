import { useMutation } from '@apollo/client/react';
import {
  type DeleteWorkspaceInvitationMutationVariables,
  DeleteWorkspaceInvitationDocument,
  GetWorkspaceInvitationsDocument,
} from '~/generated-metadata/graphql';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export const useDeleteWorkspaceInvitation = () => {
  const [deleteWorkspaceInvitationMutation] = useMutation(
    DeleteWorkspaceInvitationDocument,
  );

  const { enqueueErrorSnackBar } = useSnackBar();

  const deleteWorkspaceInvitation = async ({
    appTokenId,
  }: DeleteWorkspaceInvitationMutationVariables) => {
    return await deleteWorkspaceInvitationMutation({
      variables: {
        appTokenId,
      },
      refetchQueries: [GetWorkspaceInvitationsDocument],
      onError: (error) => {
        enqueueErrorSnackBar({ apolloError: error });
      },
    });
  };

  return {
    deleteWorkspaceInvitation,
  };
};
