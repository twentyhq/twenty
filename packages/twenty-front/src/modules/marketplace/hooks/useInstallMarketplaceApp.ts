import { useInstallApp } from '~/modules/marketplace/hooks/useInstallApp';
import { useInstallMarketplaceAppMutation } from '~/generated-metadata/graphql';

export const useInstallMarketplaceApp = () => {
  const [installMarketplaceAppMutation] = useInstallMarketplaceAppMutation();

  return useInstallApp<{
    universalIdentifier: string;
    version?: string;
  }>(installMarketplaceAppMutation);
};
