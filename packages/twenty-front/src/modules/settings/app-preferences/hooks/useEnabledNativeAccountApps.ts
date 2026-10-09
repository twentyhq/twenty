import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isImapSmtpCaldavEnabledState } from '@/client-config/states/isImapSmtpCaldavEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { NATIVE_ACCOUNT_APPS } from '@/settings/app-preferences/constants/NativeAccountApps';
import { type NativeAccountApp } from '@/settings/app-preferences/types/NativeAccountApp';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useEnabledNativeAccountApps = () => {
  const isGoogleMessagingEnabled = useAtomStateValue(
    isGoogleMessagingEnabledState,
  );
  const isGoogleCalendarEnabled = useAtomStateValue(
    isGoogleCalendarEnabledState,
  );
  const isMicrosoftMessagingEnabled = useAtomStateValue(
    isMicrosoftMessagingEnabledState,
  );
  const isMicrosoftCalendarEnabled = useAtomStateValue(
    isMicrosoftCalendarEnabledState,
  );
  const isImapSmtpCaldavEnabled = useAtomStateValue(
    isImapSmtpCaldavEnabledState,
  );

  const isAppEnabled: Record<NativeAccountApp['id'], boolean> = {
    gmail: isGoogleMessagingEnabled,
    'google-calendar': isGoogleCalendarEnabled,
    outlook: isMicrosoftMessagingEnabled || isMicrosoftCalendarEnabled,
    imap: isImapSmtpCaldavEnabled,
  };

  return {
    enabledNativeAccountApps: NATIVE_ACCOUNT_APPS.filter(
      (app) => isAppEnabled[app.id],
    ),
  };
};
