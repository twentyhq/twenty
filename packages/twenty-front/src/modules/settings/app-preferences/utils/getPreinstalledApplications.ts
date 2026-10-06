import { type PreinstalledApplication } from '@/settings/app-preferences/types/PreinstalledApplication';
import { getPreinstalledApplication } from '@/settings/app-preferences/utils/getPreinstalledApplication';

type PreinstalledApplicationsAvailability = {
  isGoogleMessagingEnabled: boolean;
  isGoogleCalendarEnabled: boolean;
  isMicrosoftMessagingEnabled: boolean;
  isMicrosoftCalendarEnabled: boolean;
  isImapSmtpCaldavEnabled: boolean;
};

export const getPreinstalledApplications = ({
  isGoogleMessagingEnabled,
  isGoogleCalendarEnabled,
  isMicrosoftMessagingEnabled,
  isMicrosoftCalendarEnabled,
  isImapSmtpCaldavEnabled,
}: PreinstalledApplicationsAvailability): PreinstalledApplication[] => [
  ...(isGoogleMessagingEnabled ? [getPreinstalledApplication('gmail')] : []),
  ...(isGoogleCalendarEnabled
    ? [getPreinstalledApplication('google-calendar')]
    : []),
  ...(isMicrosoftMessagingEnabled || isMicrosoftCalendarEnabled
    ? [getPreinstalledApplication('outlook')]
    : []),
  ...(isImapSmtpCaldavEnabled
    ? [getPreinstalledApplication('imap-smtp-caldav')]
    : []),
];
