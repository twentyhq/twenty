/* @license Enterprise */

import { GET_AUTHORIZATION_URL } from '@/auth/graphql/mutations/getAuthorizationUrl';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useApolloClient } from '@apollo/client';
import { GetAuthorizationUrlMutationVariables } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

export const useSSO = () => {
  const apolloClient = useApolloClient();
  const { enqueueSnackBar } = useSnackBar();

  const { redirect } = useRedirect();

  const getAuthorizationUrlForSSO = async ({
    identityProviderId,
  }: GetAuthorizationUrlMutationVariables['input']) => {
    return await apolloClient.mutate({
      mutation: GET_AUTHORIZATION_URL,
      variables: {
        input: { identityProviderId },
      },
    });
  };

  const redirectToSSOLoginPage = async (identityProviderId: string) => {
    const authorizationUrlForSSOResult = await getAuthorizationUrlForSSO({
      identityProviderId,
    });

    if (
      isDefined(authorizationUrlForSSOResult.errors) ||
      !authorizationUrlForSSOResult.data ||
      !authorizationUrlForSSOResult.data?.getAuthorizationUrl.authorizationURL
    ) {
      return enqueueSnackBar(
        authorizationUrlForSSOResult.errors?.[0]?.message ?? 'Unknown error',
        {
          variant: SnackBarVariant.Error,
        },
      );
    }

    redirect(
      authorizationUrlForSSOResult.data?.getAuthorizationUrl.authorizationURL,
    );
  };

  return {
    redirectToSSOLoginPage,
    getAuthorizationUrlForSSO,
  };
};
