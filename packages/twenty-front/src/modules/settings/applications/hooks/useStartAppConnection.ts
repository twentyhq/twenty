import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { SettingsPath } from 'twenty-shared/types';

import { useTriggerAppOAuth } from '@/settings/applications/hooks/useTriggerAppOAuth';
import { isApiKeyConnectionProviderType } from '@/settings/applications/utils/isApiKeyConnectionProviderType';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useStartAppConnection = () => {
  const { triggerAppOAuth } = useTriggerAppOAuth();
  const navigateSettings = useNavigateSettings();

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
          isNonEmptyString(reconnectingConnectedAccountId)
            ? { reconnectingConnectedAccountId }
            : undefined,
          {
            state: {
              returnTo:
                redirectLocation ??
                `${window.location.pathname}${window.location.search}${window.location.hash}`,
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
    [navigateSettings, triggerAppOAuth],
  );

  return { startAppConnection };
};
