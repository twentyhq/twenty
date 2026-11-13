import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';

import { useTriggerAppOAuth } from '@/settings/applications/hooks/useTriggerAppOAuth';
import { isApiKeyConnectionProviderType } from '@/settings/applications/utils/isApiKeyConnectionProviderType';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useStartAppConnection = () => {
  const { triggerAppOAuth } = useTriggerAppOAuth();
  const navigateSettings = useNavigateSettings();
  const location = useLocation();

  const startAppConnection = useCallback(
    async ({
      applicationId,
      connectionProviderName,
      connectionProviderType,
      reconnectingConnectedAccountId,
      redirectLocation,
    }: {
      applicationId: string;
      connectionProviderName: string;
      connectionProviderType: string;
      reconnectingConnectedAccountId?: string;
      redirectLocation?: string;
    }) => {
      if (isApiKeyConnectionProviderType(connectionProviderType)) {
        navigateSettings(
          SettingsPath.ApplicationConnectWithApiKey,
          { applicationId, connectionProviderName },
          reconnectingConnectedAccountId
            ? { reconnectingConnectedAccountId }
            : undefined,
          {
            state: {
              returnTo:
                redirectLocation ??
                `${location.pathname}${location.search}${location.hash}`,
            },
          },
        );

        return;
      }

      await triggerAppOAuth({
        applicationId,
        providerName: connectionProviderName,
        reconnectingConnectedAccountId,
        redirectLocation,
      });
    },
    [location, navigateSettings, triggerAppOAuth],
  );

  return { startAppConnection };
};
