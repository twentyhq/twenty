import { useInstallMarketplaceAppMutation } from '~/generated/graphql';

export const useInstallMarketplaceApp = () => {
  const [installMarketplaceAppMutation, { loading, error }] =
    useInstallMarketplaceAppMutation();

  const install = async () => {
    const result = await installMarketplaceAppMutation();

    return result.data?.installMarketplaceApp ?? false;
  };

  return {
    install,
    isLoading: loading,
    error,
  };
};
