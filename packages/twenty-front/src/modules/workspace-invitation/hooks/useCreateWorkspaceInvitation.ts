import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useMutation } from '@apollo/client/react';
import { useToast } from 'twenty-ui/feedback';
import {
  type SendInvitationsMutationVariables,
  GetWorkspaceInvitationsDocument,
  SendInvitationsDocument,
} from '~/generated-metadata/graphql';

export const useCreateWorkspaceInvitation = () => {
  const [sendInvitationsMutation] = useMutation(SendInvitationsDocument);

  const { enqueueToast } = useToast();

  const sendInvitation = async (
    variables: SendInvitationsMutationVariables,
  ) => {
    return await sendInvitationsMutation({
      variables,
      refetchQueries: [GetWorkspaceInvitationsDocument],
      onError: (error) => {
        enqueueToast(getToastOptionsFromError({ error }));
      },
    });
  };

  return {
    sendInvitation,
  };
};
