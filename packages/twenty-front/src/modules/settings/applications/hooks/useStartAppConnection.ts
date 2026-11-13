import { useCallback } from 'react';

import { useTriggerAppOAuth } from '@/settings/applications/hooks/useTriggerAppOAuth';
import { isApiKeyConnectionProviderType } from '@/settings/applications/utils/isApiKeyConnectionProviderType';
import { useOpenConnectApplicationWithApiKeyInSidePanel } from '@/side-panel/hooks/useOpenConnectApplicationWithApiKeyInSidePanel';

export const useStartAppConnection = () => {
  const { triggerAppOAuth } = useTriggerAppOAuth();
  const { openConnectApplicationWithApiKeyInSidePanel } =
    useOpenConnectApplicationWithApiKeyInSidePanel();

  const startAppConnection = useCallback(
    async ({
      applicationId,
      connectionProviderName,
      connectionProviderDisplayName,
      connectionProviderType,
      reconnectingConnectedAccountId,
      redirectLocation,
    }: {
      applicationId: string;
      connectionProviderName: string;
      connectionProviderDisplayName: string;
      connectionProviderType: string;
      reconnectingConnectedAccountId?: string;
      redirectLocation?: string;
    }) => {
      if (isApiKeyConnectionProviderType(connectionProviderType)) {
        openConnectApplicationWithApiKeyInSidePanel({
          applicationId,
          providerName: connectionProviderName,
          providerDisplayName: connectionProviderDisplayName,
          reconnectingConnectedAccountId:
            reconnectingConnectedAccountId ?? null,
        });

        return;
      }

      await triggerAppOAuth({
        applicationId,
        providerName: connectionProviderName,
        reconnectingConnectedAccountId,
        redirectLocation,
      });
    },
    [openConnectApplicationWithApiKeyInSidePanel, triggerAppOAuth],
  );

  return { startAppConnection };
};
