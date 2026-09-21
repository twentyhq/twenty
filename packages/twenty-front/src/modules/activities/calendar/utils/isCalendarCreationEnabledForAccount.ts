import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import {
  canConnectedAccountCreateCalendarEvent,
  isDefined,
} from 'twenty-shared/utils';

export const isCalendarCreationEnabledForAccount = (
  account: Pick<
    ConnectedAccount,
    'archivedAt' | 'provider' | 'connectionParameters'
  > & {
    calendarChannels: Pick<CalendarChannel, 'isSyncEnabled'>[];
  },
) =>
  !isDefined(account.archivedAt) &&
  canConnectedAccountCreateCalendarEvent(account) &&
  account.calendarChannels.some((channel) => channel.isSyncEnabled);
