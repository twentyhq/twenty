import { useMutation } from '@apollo/client/react';
import {
  type SendInvitationsMutationVariables,
  SendInvitationsDocument,
  GetWorkspaceInvitationsDocument,
} from '~/generated-metadata/graphql';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export const useCreateWorkspaceInvitation = () => {
  const [sendInvitationsMutation] = useMutation(SendInvitationsDocument);

  const { enqueueErrorSnackBar } = useSnackBar();

  const sendInvitation = async (
    variables: SendInvitationsMutationVariables,
  ) => {
    return await sendInvitationsMutation({
      variables,
      refetchQueries: [GetWorkspaceInvitationsDocument],
      onError: (error) => {
        enqueueErrorSnackBar({ apolloError: error });
      },
    });
  };

  return {
    sendInvitation,
  };
};
