import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { MessageChannelType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const isGettingStartedMailboxAccount = (
  account: Pick<ConnectedAccount, 'archivedAt'> & {
    messageChannels: Pick<MessageChannel, 'type'>[];
    calendarChannels: Pick<CalendarChannel, 'id'>[];
  },
): boolean =>
  !isDefined(account.archivedAt) &&
  (account.messageChannels.some(
    (messageChannel) => messageChannel.type === MessageChannelType.EMAIL,
  ) ||
    isNonEmptyArray(account.calendarChannels));
