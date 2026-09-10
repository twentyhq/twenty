import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useMutation } from '@apollo/client/react';
import { useToast } from 'twenty-ui/feedback';
import {
  type DeleteWorkspaceInvitationMutationVariables,
  DeleteWorkspaceInvitationDocument,
  GetWorkspaceInvitationsDocument,
} from '~/generated-metadata/graphql';

export const useDeleteWorkspaceInvitation = () => {
  const [deleteWorkspaceInvitationMutation] = useMutation(
    DeleteWorkspaceInvitationDocument,
  );

  const { enqueueToast } = useToast();

  const deleteWorkspaceInvitation = async ({
    appTokenId,
  }: DeleteWorkspaceInvitationMutationVariables) => {
    return await deleteWorkspaceInvitationMutation({
      variables: {
        appTokenId,
      },
      refetchQueries: [GetWorkspaceInvitationsDocument],
      onError: (error) => {
        enqueueToast(getToastOptionsFromError({ error }));
      },
    });
  };

  return {
    deleteWorkspaceInvitation,
  };
};
