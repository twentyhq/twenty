/* @license Enterprise */

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

    window.location.href =
      authorizationUrlForSSOResult.data?.getAuthorizationUrl.authorizationURL;
    return;
  };

  return {
    redirectToSSOLoginPage,
    getAuthorizationUrlForSSO,
  };
};
