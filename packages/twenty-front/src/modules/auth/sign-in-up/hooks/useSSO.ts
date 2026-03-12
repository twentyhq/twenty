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
        ...(CombinedGraphQLErrors.is(error) ? { apolloError: error } : {}),
      });
    }

    const authorizationURL =
      authorizationUrlForSSOResult.data?.getAuthorizationUrlForSSO
        ?.authorizationURL;

    if (authorizationURL) {
      redirect(authorizationURL);
    }
  };

  return {
    redirectToSSOLoginPage,
  };
};
