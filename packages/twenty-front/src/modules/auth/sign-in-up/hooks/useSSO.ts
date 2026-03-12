/* @license Enterprise */

import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useApolloClient } from '@apollo/client/react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useParams } from 'react-router-dom';
import { GetAuthorizationUrlForSsoDocument } from '~/generated-metadata/graphql';

export const useSSO = () => {
  const apolloClient = useApolloClient();
  const workspaceInviteHash = useParams().workspaceInviteHash;

  const { enqueueErrorSnackBar } = useSnackBar();
  const { redirect } = useRedirect();
  const redirectToSSOLoginPage = async (identityProviderId: string) => {
    let authorizationUrlForSSOResult;
    try {
      authorizationUrlForSSOResult = await apolloClient.mutate({
        mutation: GetAuthorizationUrlForSsoDocument,
        variables: {
          input: {
            identityProviderId,
            workspaceInviteHash,
          },
        },
      });
    } catch (error: any) {
      return enqueueErrorSnackBar({
        ...(error instanceof CombinedGraphQLErrors ? { apolloError: error } : {}),
      });
    }

    redirect(
      authorizationUrlForSSOResult.data?.getAuthorizationUrlForSSO
        .authorizationURL,
    );
  };

  return {
    redirectToSSOLoginPage,
  };
};
