import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { ConnectedAccountProvider, SettingsPath } from 'twenty-shared/types';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useAddBuiltInAccount = () => {
  const navigateSettings = useNavigateSettings();
  const { triggerApisOAuth } = useTriggerApisOAuth();

  const addBuiltInAccount = (builtInAccountApp: BuiltInAccountApp) => {
    if (
      builtInAccountApp.provider === ConnectedAccountProvider.IMAP_SMTP_CALDAV
    ) {
      navigateSettings(SettingsPath.NewImapSmtpCaldavConnection);
      return;
    }

    triggerApisOAuth(builtInAccountApp.provider);
  };

  return { addBuiltInAccount };
};
