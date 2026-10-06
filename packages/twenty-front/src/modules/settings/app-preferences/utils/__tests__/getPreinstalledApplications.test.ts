import { getPreinstalledApplications } from '@/settings/app-preferences/utils/getPreinstalledApplications';
import { SettingsPath } from 'twenty-shared/types';

const NOTHING_ENABLED = {
  isGoogleMessagingEnabled: false,
  isGoogleCalendarEnabled: false,
  isMicrosoftMessagingEnabled: false,
  isMicrosoftCalendarEnabled: false,
  isImapSmtpCaldavEnabled: false,
};

describe('getPreinstalledApplications', () => {
  it('should return nothing when no provider is enabled', () => {
    expect(getPreinstalledApplications(NOTHING_ENABLED)).toEqual([]);
  });

  it('should list every preinstalled app when every provider is enabled', () => {
    const result = getPreinstalledApplications({
      isGoogleMessagingEnabled: true,
      isGoogleCalendarEnabled: true,
      isMicrosoftMessagingEnabled: true,
      isMicrosoftCalendarEnabled: true,
      isImapSmtpCaldavEnabled: true,
    });

    expect(result.map(({ id }) => id)).toEqual([
      'gmail',
      'google-calendar',
      'outlook',
      'imap-smtp-caldav',
    ]);
  });

  it('should send Gmail to the emails page and Google Calendar to the calendars page', () => {
    const result = getPreinstalledApplications({
      ...NOTHING_ENABLED,
      isGoogleMessagingEnabled: true,
      isGoogleCalendarEnabled: true,
    });

    expect(result.map(({ settingsPath }) => settingsPath)).toEqual([
      SettingsPath.AccountsEmails,
      SettingsPath.AccountsCalendars,
    ]);
  });

  it('should list Outlook once when only Microsoft calendar is enabled', () => {
    const result = getPreinstalledApplications({
      ...NOTHING_ENABLED,
      isMicrosoftCalendarEnabled: true,
    });

    expect(result.map(({ id }) => id)).toEqual(['outlook']);
  });
});
