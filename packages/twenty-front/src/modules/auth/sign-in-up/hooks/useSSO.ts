/* @license Enterprise */

import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  GetAuthorizationUrlMutationVariables,
  useGetAuthorizationUrlMutation,
} from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

export const useSSO = () => {
  const { enqueueSnackBar } = useSnackBar();

  const [getAuthorizationUrlMutation] = useGetAuthorizationUrlMutation();

  const { redirect } = useRedirect();

  const getAuthorizationUrlForSSO = async ({
    identityProviderId,
  }: GetAuthorizationUrlMutationVariables['input']) => {
    return await getAuthorizationUrlMutation({
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
