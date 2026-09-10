import { useErrorToast } from '@/error-handler/hooks/useErrorToast';
import { useMutation } from '@apollo/client/react';
import {
  type ResendWorkspaceInvitationMutationVariables,
  GetWorkspaceInvitationsDocument,
  ResendWorkspaceInvitationDocument,
} from '~/generated-metadata/graphql';

export const useResendWorkspaceInvitation = () => {
  const [resendWorkspaceInvitationMutation] = useMutation(
    ResendWorkspaceInvitationDocument,
  );

  const { addErrorToast } = useErrorToast();

  const resendInvitation = async ({
    appTokenId,
  }: ResendWorkspaceInvitationMutationVariables) => {
    return await resendWorkspaceInvitationMutation({
      variables: {
        appTokenId,
      },
      refetchQueries: [GetWorkspaceInvitationsDocument],
      onError: (error) => {
        addErrorToast(error);
      },
    });
  };

  return {
    resendInvitation,
  };
};
