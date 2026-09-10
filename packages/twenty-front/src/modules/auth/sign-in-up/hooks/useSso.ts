/* @license Enterprise */

import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useErrorToast } from '@/error-handler/hooks/useErrorToast';

import { useApolloClient } from '@apollo/client/react';
import { useParams } from 'react-router-dom';

import { GetAuthorizationUrlForSsoDocument } from '~/generated-metadata/graphql';

export const useSso = () => {
  const apolloClient = useApolloClient();
  const workspaceInviteHash = useParams().workspaceInviteHash;

  const { enqueueErrorToast } = useErrorToast();
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
      return enqueueErrorToast(error);
    }

    const authorizationURL =
      authorizationUrlForSsoResult.data?.getAuthorizationUrlForSSO
        ?.authorizationURL;

    if (authorizationURL) {
      redirect(authorizationURL);
    }
  };

  return {
    redirectToSsoLoginPage,
  };
};
