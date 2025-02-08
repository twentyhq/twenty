/* @license Enterprise */

import { GET_AUTHORIZATION_URL } from '@/auth/graphql/mutations/getAuthorizationUrl';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useApolloClient } from '@apollo/client';
import { useParams } from 'react-router-dom';

export const useSSO = () => {
  const apolloClient = useApolloClient();
  const workspaceInviteHash = useParams().workspaceInviteHash;

  const { enqueueSnackBar } = useSnackBar();
  const { redirect } = useRedirect();
  const redirectToSSOLoginPage = async (identityProviderId: string) => {
    let authorizationUrlForSSOResult;
    try {
      authorizationUrlForSSOResult = await apolloClient.mutate({
        mutation: GET_AUTHORIZATION_URL,
        variables: {
          input: {
            identityProviderId,
            workspaceInviteHash,
          },
        },
      });
    } catch (error: any) {
      return enqueueSnackBar(error?.message ?? 'Unknown error', {
        variant: SnackBarVariant.Error,
      });
    }

    redirect(
      authorizationUrlForSSOResult.data?.getAuthorizationUrl.authorizationURL,
    );
  };

  return {
    redirectToSSOLoginPage,
  };
};
