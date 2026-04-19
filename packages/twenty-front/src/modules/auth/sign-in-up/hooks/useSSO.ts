/* @license Enterprise */

import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useApolloClient } from '@apollo/client/react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useParams } from 'react-router-dom';
import { GetAuthorizationUrlForSsoDocument } from '~/generated-metadata/graphql';

export const useSso = () => {
  const apolloClient = useApolloClient();
  const workspaceInviteHash = useParams().workspaceInviteHash;

  const { enqueueErrorSnackBar } = useSnackBar();
  const { redirect } = useRedirect();
  const redirectToSsoLoginPage = async (identityProviderId: string) => {
    let authorizationUrlForSsoResult;
    try {
      authorizationUrlForSsoResult = await apolloClient.mutate({
        mutation: GetAuthorizationUrlForSsoDocument,
        variables: {
          input: {
            identityProviderId,
            workspaceInviteHash,
          },
        },
      });
    } catch (error: unknown) {
      return enqueueErrorSnackBar(
        CombinedGraphQLErrors.is(error)
          ? { apolloError: error }
          : { message: error instanceof Error ? error.message : undefined },
      );
    }

    const authorizationURL =
      authorizationUrlForSsoResult.data?.getAuthorizationUrlForSso
        ?.authorizationURL;

    if (authorizationURL) {
      redirect(authorizationURL);
    }
  };

  return {
    redirectToSsoLoginPage,
  };
};
