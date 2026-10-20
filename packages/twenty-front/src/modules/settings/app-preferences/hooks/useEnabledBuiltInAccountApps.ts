import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isImapSmtpCaldavEnabledState } from '@/client-config/states/isImapSmtpCaldavEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { BUILT_IN_ACCOUNT_APPS } from '@/settings/app-preferences/constants/BuiltInAccountApps';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useEnabledBuiltInAccountApps = () => {
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

  const isEmailsEnabled: Record<BuiltInAccountApp['id'], boolean> = {
    google: isGoogleMessagingEnabled,
    outlook: isMicrosoftMessagingEnabled,
    imap: isImapSmtpCaldavEnabled,
  };
  const isCalendarEnabled: Record<BuiltInAccountApp['id'], boolean> = {
    google: isGoogleCalendarEnabled,
    outlook: isMicrosoftCalendarEnabled,
    imap: isImapSmtpCaldavEnabled,
  };

  return {
    enabledBuiltInAccountApps: BUILT_IN_ACCOUNT_APPS.map((app) => ({
      ...app,
      hasEmails: app.hasEmails && isEmailsEnabled[app.id],
      hasCalendar: app.hasCalendar && isCalendarEnabled[app.id],
    })).filter((app) => app.hasEmails || app.hasCalendar),
  };
};
