import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { type PreinstalledApplicationId } from '@/settings/app-preferences/types/PreinstalledApplication';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

// The preinstalled apps an account is used by, read from its sync channels: a
// Google account with no calendar channel is not used by Google Calendar.
export const getPreinstalledApplicationIdsForAccount = (
  account: Pick<
    ConnectedAccount,
    'provider' | 'messageChannels' | 'calendarChannels'
  >,
): PreinstalledApplicationId[] => {
  const hasMessageChannel = isNonEmptyArray(account.messageChannels);
  const hasCalendarChannel = isNonEmptyArray(account.calendarChannels);

  switch (account.provider) {
    case ConnectedAccountProvider.GOOGLE:
      return [
        ...(hasMessageChannel ? (['gmail'] as const) : []),
        ...(hasCalendarChannel ? (['google-calendar'] as const) : []),
      ];
    case ConnectedAccountProvider.MICROSOFT:
      return hasMessageChannel || hasCalendarChannel ? ['outlook'] : [];
    case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
      return hasMessageChannel || hasCalendarChannel
        ? ['imap-smtp-caldav']
        : [];
    default:
      return [];
  }
};
