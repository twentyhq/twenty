import { useCallback } from 'react';
import { ConnectedAccountProvider, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { useResolveAccountsSettingsPath } from '@/settings/app-preferences/hooks/useResolveAccountsSettingsPath';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useTriggerProviderReconnect = () => {
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const navigate = useNavigateSettings();
  const { resolveAccountsSettingsPath } = useResolveAccountsSettingsPath();

  const triggerProviderReconnect = useCallback(
    async (
      provider: ConnectedAccountProvider,
      accountId?: string,
      options?: Parameters<typeof triggerApisOAuth>[1],
    ) => {
      if (provider === ConnectedAccountProvider.IMAP_SMTP_CALDAV) {
        if (!accountId) {
          navigate(
            resolveAccountsSettingsPath(
              SettingsPath.NewImapSmtpCaldavConnection,
            ),
          );
          return;
        }

        navigate(
          resolveAccountsSettingsPath(
            SettingsPath.EditImapSmtpCaldavConnection,
          ),
          {
            connectedAccountId: accountId,
          },
        );
        return;
      }

      await triggerApisOAuth(provider, {
        redirectLocation: getSettingsPath(
          resolveAccountsSettingsPath(SettingsPath.Accounts),
        ),
        ...options,
      });
    },
    [triggerApisOAuth, navigate, resolveAccountsSettingsPath],
  );

  return { triggerProviderReconnect };
};
