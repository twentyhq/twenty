import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isImapSmtpCaldavEnabledState } from '@/client-config/states/isImapSmtpCaldavEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { type BuiltInApp } from '@/settings/app-preferences/types/BuiltInApp';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import {
  IconAt,
  IconGmail,
  IconGoogleCalendar,
  IconMicrosoftOutlook,
} from 'twenty-ui/icon';

export const useBuiltInApps = () => {
  const { t } = useLingui();
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

  const builtInApps: BuiltInApp[] = [];

  if (isMicrosoftMessagingEnabled || isMicrosoftCalendarEnabled) {
    builtInApps.push({
      id: 'outlook',
      name: t`Outlook`,
      Icon: IconMicrosoftOutlook,
      provider: ConnectedAccountProvider.MICROSOFT,
      hasMessaging: isMicrosoftMessagingEnabled,
      hasCalendar: isMicrosoftCalendarEnabled,
    });
  }

  if (isGoogleMessagingEnabled) {
    builtInApps.push({
      id: 'gmail',
      name: t`Gmail`,
      Icon: IconGmail,
      provider: ConnectedAccountProvider.GOOGLE,
      hasMessaging: true,
      hasCalendar: false,
    });
  }

  if (isGoogleCalendarEnabled) {
    builtInApps.push({
      id: 'google-calendar',
      name: t`Google Calendar`,
      Icon: IconGoogleCalendar,
      provider: ConnectedAccountProvider.GOOGLE,
      hasMessaging: false,
      hasCalendar: true,
    });
  }

  if (isImapSmtpCaldavEnabled) {
    builtInApps.push({
      id: 'imap-smtp-caldav',
      name: t`Email IMAP connector`,
      Icon: IconAt,
      provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
      hasMessaging: true,
      hasCalendar: true,
    });
  }

  return { builtInApps };
};
