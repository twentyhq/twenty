import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useMutation } from '@apollo/client/react';
import { useToast } from 'twenty-ui/feedback';
import {
  type ResendWorkspaceInvitationMutationVariables,
  GetWorkspaceInvitationsDocument,
  ResendWorkspaceInvitationDocument,
} from '~/generated-metadata/graphql';

export const useResendWorkspaceInvitation = () => {
  const [resendWorkspaceInvitationMutation] = useMutation(
    ResendWorkspaceInvitationDocument,
  );

  const { enqueueToast } = useToast();

  const resendInvitation = async ({
    appTokenId,
  }: ResendWorkspaceInvitationMutationVariables) => {
    return await resendWorkspaceInvitationMutation({
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
    resendInvitation,
  };
};
