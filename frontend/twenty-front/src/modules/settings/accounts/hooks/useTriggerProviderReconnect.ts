import { useCallback } from 'react';
import { ConnectedAccountProvider, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useTriggerProviderReconnect = () => {
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const navigate = useNavigateSettings();

  const triggerProviderReconnect = useCallback(
    async (
      provider: ConnectedAccountProvider,
      accountId?: string,
      options?: Parameters<typeof triggerApisOAuth>[1],
    ) => {
      if (provider === ConnectedAccountProvider.IMAP_SMTP_CALDAV) {
        if (!accountId) {
          navigate(SettingsPath.NewImapSmtpCaldavConnection);
          return;
        }

        navigate(SettingsPath.EditImapSmtpCaldavConnection, {
          connectedAccountId: accountId,
        });
        return;
      }

      await triggerApisOAuth(provider, {
        ...options,
        redirectLocation: getSettingsPath(SettingsPath.Accounts),
      });
    },
    [triggerApisOAuth, navigate],
  );

  return { triggerProviderReconnect };
};
