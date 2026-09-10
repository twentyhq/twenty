import { useErrorToast } from '@/error-handler/hooks/useErrorToast';
import { useMutation } from '@apollo/client/react';
import {
  type SendInvitationsMutationVariables,
  GetWorkspaceInvitationsDocument,
  SendInvitationsDocument,
} from '~/generated-metadata/graphql';

export const useCreateWorkspaceInvitation = () => {
  const [sendInvitationsMutation] = useMutation(SendInvitationsDocument);

  const { enqueueErrorToast } = useErrorToast();

  const sendInvitation = async (
    variables: SendInvitationsMutationVariables,
  ) => {
    return await sendInvitationsMutation({
      variables,
      refetchQueries: [GetWorkspaceInvitationsDocument],
      onError: (error) => {
        enqueueErrorToast(error);
      },
    });
  };

  return {
    sendInvitation,
  };
};
