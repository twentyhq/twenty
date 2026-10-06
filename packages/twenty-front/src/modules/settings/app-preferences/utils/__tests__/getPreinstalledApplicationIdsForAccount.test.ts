import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { getPreinstalledApplicationIdsForAccount } from '@/settings/app-preferences/utils/getPreinstalledApplicationIdsForAccount';
import { ConnectedAccountProvider } from 'twenty-shared/types';

const MESSAGE_CHANNEL = { id: 'message-channel' } as MessageChannel;
const CALENDAR_CHANNEL = { id: 'calendar-channel' } as CalendarChannel;

describe('getPreinstalledApplicationIdsForAccount', () => {
  it('should map a Google account to Gmail and Google Calendar from its channels', () => {
    expect(
      getPreinstalledApplicationIdsForAccount({
        provider: ConnectedAccountProvider.GOOGLE,
        messageChannels: [MESSAGE_CHANNEL],
        calendarChannels: [CALENDAR_CHANNEL],
      }),
    ).toEqual(['gmail', 'google-calendar']);
  });

  it('should leave Google Calendar out when the account has no calendar channel', () => {
    expect(
      getPreinstalledApplicationIdsForAccount({
        provider: ConnectedAccountProvider.GOOGLE,
        messageChannels: [MESSAGE_CHANNEL],
        calendarChannels: [],
      }),
    ).toEqual(['gmail']);
  });

  it('should map a Microsoft account to Outlook once', () => {
    expect(
      getPreinstalledApplicationIdsForAccount({
        provider: ConnectedAccountProvider.MICROSOFT,
        messageChannels: [MESSAGE_CHANNEL],
        calendarChannels: [CALENDAR_CHANNEL],
      }),
    ).toEqual(['outlook']);
  });

  it('should map an IMAP account to the IMAP connector', () => {
    expect(
      getPreinstalledApplicationIdsForAccount({
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        messageChannels: [],
        calendarChannels: [CALENDAR_CHANNEL],
      }),
    ).toEqual(['imap-smtp-caldav']);
  });

  it('should return nothing for an account without channels or for an app account', () => {
    expect(
      getPreinstalledApplicationIdsForAccount({
        provider: ConnectedAccountProvider.MICROSOFT,
        messageChannels: [],
        calendarChannels: [],
      }),
    ).toEqual([]);
    expect(
      getPreinstalledApplicationIdsForAccount({
        provider: ConnectedAccountProvider.APP,
        messageChannels: [MESSAGE_CHANNEL],
        calendarChannels: [],
      }),
    ).toEqual([]);
  });
});
