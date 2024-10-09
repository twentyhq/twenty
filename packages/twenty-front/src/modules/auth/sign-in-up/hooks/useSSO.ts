import { isDefined } from '~/utils/isDefined';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  FindAvailableSsoIdentityProvidersMutationVariables,
  GetAuthorizationUrlMutationVariables,
  useFindAvailableSsoIdentityProvidersMutation,
  useGetAuthorizationUrlMutation,
} from '~/generated/graphql';

export const useSSO = () => {
  const { enqueueSnackBar } = useSnackBar();

  const [findAvailableSSOProviderByEmailMutation] =
    useFindAvailableSsoIdentityProvidersMutation();
  const [getAuthorizationUrlMutation] = useGetAuthorizationUrlMutation();

  const findAvailableSSOProviderByEmail = async ({
    email,
  }: FindAvailableSsoIdentityProvidersMutationVariables['input']) => {
    return await findAvailableSSOProviderByEmailMutation({
      variables: {
        input: { email },
      },
    });
  };

  const getAuthorizationUrlForSSO = async ({
    idpId,
  }: GetAuthorizationUrlMutationVariables['input']) => {
    return await getAuthorizationUrlMutation({
      variables: {
        input: { idpId },
      },
    });
  };

  const redirectToSSOLoginPage = async (idpId: string) => {
    const authorizationUrlForSSOResult = await getAuthorizationUrlForSSO({
      idpId,
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
    findAvailableSSOProviderByEmail,
  };
};
