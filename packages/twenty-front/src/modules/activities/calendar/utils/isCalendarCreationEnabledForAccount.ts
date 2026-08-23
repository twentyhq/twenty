import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const CALENDAR_CREATION_PROVIDERS = new Set([
  ConnectedAccountProvider.GOOGLE,
  ConnectedAccountProvider.MICROSOFT,
  ConnectedAccountProvider.IMAP_SMTP_CALDAV,
]);

export const isCalendarCreationEnabledForAccount = (
  account: ConnectedAccount,
) =>
  !isDefined(account.archivedAt) &&
  CALENDAR_CREATION_PROVIDERS.has(account.provider) &&
  account.calendarChannels.some((channel) => channel.isSyncEnabled) &&
  (account.provider !== ConnectedAccountProvider.IMAP_SMTP_CALDAV ||
    isDefined(account.connectionParameters?.CALDAV));
