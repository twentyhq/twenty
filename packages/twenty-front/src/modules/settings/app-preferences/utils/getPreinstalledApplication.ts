import {
  type PreinstalledApplication,
  type PreinstalledApplicationId,
} from '@/settings/app-preferences/types/PreinstalledApplication';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import {
  IconGmail,
  IconGoogleCalendar,
  IconMailCog,
  IconMicrosoftOutlook,
} from 'twenty-ui/icon';

export const getPreinstalledApplication = (
  id: PreinstalledApplicationId,
): PreinstalledApplication => {
  switch (id) {
    case 'gmail':
      return {
        id,
        name: 'Gmail',
        typeLabel: t`Email`,
        Icon: IconGmail,
        settingsPath: SettingsPath.AccountsEmails,
      };
    case 'google-calendar':
      return {
        id,
        name: 'Google Calendar',
        typeLabel: t`Calendar`,
        Icon: IconGoogleCalendar,
        settingsPath: SettingsPath.AccountsCalendars,
      };
    case 'outlook':
      return {
        id,
        name: 'Outlook',
        typeLabel: t`Email & Calendar`,
        Icon: IconMicrosoftOutlook,
        settingsPath: SettingsPath.AccountsEmails,
      };
    case 'imap-smtp-caldav':
      return {
        id,
        name: t`Email IMAP connector`,
        typeLabel: t`Email & Calendar`,
        Icon: IconMailCog,
        settingsPath: SettingsPath.AccountsEmails,
      };
  }
};
