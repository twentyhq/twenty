import { useInstallApp } from '~/modules/marketplace/hooks/useInstallApp';
import { useMutation } from '@apollo/client/react';
import { InstallMarketplaceAppDocument } from '~/generated-metadata/graphql';

export const useInstallMarketplaceApp = () => {
  const [installMarketplaceAppMutation] = useMutation(
    InstallMarketplaceAppDocument,
  );

  return useInstallApp<{
    universalIdentifier: string;
    version?: string;
  }>(installMarketplaceAppMutation);
};
