/* @license Enterprise */

import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';

import { useApolloClient } from '@apollo/client/react';
import { useParams } from 'react-router-dom';

import { useToast } from 'twenty-ui/feedback';
import { GetAuthorizationUrlForSsoDocument } from '~/generated-metadata/graphql';

export const useSso = () => {
  const apolloClient = useApolloClient();
  const workspaceInviteHash = useParams().workspaceInviteHash;

  const { enqueueToast } = useToast();
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
      return enqueueToast(getToastOptionsFromError({ error }));
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
