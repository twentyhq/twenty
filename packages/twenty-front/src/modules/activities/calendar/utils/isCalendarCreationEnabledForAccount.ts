import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { ConnectedAccountOperation } from 'twenty-shared/types';
import {
  canConnectedAccountPerformOperation,
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
  canConnectedAccountPerformOperation({
    connectedAccount: account,
    operation: ConnectedAccountOperation.CREATE_CALENDAR_EVENT,
  }) &&
  account.calendarChannels.some((channel) => channel.isSyncEnabled);
