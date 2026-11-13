import { useCallback } from 'react';

import { useTriggerAppOAuth } from '@/settings/applications/hooks/useTriggerAppOAuth';
import { type ConnectableConnectionProvider } from '@/settings/applications/types/ConnectableConnectionProvider';
import { useOpenConnectApplicationWithApiKeyInSidePanel } from '@/side-panel/hooks/useOpenConnectApplicationWithApiKeyInSidePanel';

// API key providers collect the key in Twenty; every other type signs in on the provider's side
export const useStartAppConnection = () => {
  const { triggerAppOAuth } = useTriggerAppOAuth();
  const { openConnectApplicationWithApiKeyInSidePanel } =
    useOpenConnectApplicationWithApiKeyInSidePanel();

  const startAppConnection = useCallback(
    async ({
      applicationId,
      connectionProvider,
      reconnectingConnectedAccountId,
      redirectLocation,
    }: {
      applicationId: string;
      connectionProvider: ConnectableConnectionProvider;
      reconnectingConnectedAccountId?: string;
      redirectLocation?: string;
    }) => {
      if (connectionProvider.type === 'api-key') {
        openConnectApplicationWithApiKeyInSidePanel({
          applicationId,
          providerName: connectionProvider.name,
          providerDisplayName: connectionProvider.displayName,
          reconnectingConnectedAccountId:
            reconnectingConnectedAccountId ?? null,
        });

        return;
      }

      await triggerAppOAuth({
        applicationId,
        providerName: connectionProvider.name,
        reconnectingConnectedAccountId,
        redirectLocation,
      });
    },
    [openConnectApplicationWithApiKeyInSidePanel, triggerAppOAuth],
  );

  return { startAppConnection };
};
