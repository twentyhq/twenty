import { useMutation } from '@apollo/client/react';
import {
  type ResendWorkspaceInvitationMutationVariables,
  ResendWorkspaceInvitationDocument,
  GetWorkspaceInvitationsDocument,
} from '~/generated-metadata/graphql';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export const useResendWorkspaceInvitation = () => {
  const [resendWorkspaceInvitationMutation] = useMutation(
    ResendWorkspaceInvitationDocument,
  );

  const { enqueueErrorSnackBar } = useSnackBar();

  const resendInvitation = async ({
    appTokenId,
  }: ResendWorkspaceInvitationMutationVariables) => {
    return await resendWorkspaceInvitationMutation({
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
    resendInvitation,
  };
};
