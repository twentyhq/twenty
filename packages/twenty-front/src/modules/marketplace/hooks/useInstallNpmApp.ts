import { useMutation } from '@apollo/client';

import { useInstallApp } from '~/modules/marketplace/hooks/useInstallApp';
import { INSTALL_NPM_APP } from '~/modules/marketplace/graphql/mutations/installNpmApp';

export const useInstallNpmApp = () => {
  const [installNpmAppMutation] = useMutation(INSTALL_NPM_APP);

  return useInstallApp<{
    packageName: string;
    version?: string;
  }>(installNpmAppMutation);
};
