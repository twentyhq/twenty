/* @license Enterprise */

import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';

import { useApolloClient } from '@apollo/client/react';
import { useParams, useSearchParams } from 'react-router-dom';

import { useToast } from 'twenty-ui/components/feedback';
import { GetAuthorizationUrlForSsoDocument } from '~/generated-metadata/graphql';

export const useSso = () => {
  const apolloClient = useApolloClient();
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const [searchParams] = useSearchParams();
  const workspacePersonalInviteToken =
    searchParams.get('inviteToken') ?? undefined;

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
            workspacePersonalInviteToken,
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
