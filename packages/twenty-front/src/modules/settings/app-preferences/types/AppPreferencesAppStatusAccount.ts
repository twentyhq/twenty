import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { type MessageChannel } from '@/accounts/types/MessageChannel';

export type AppPreferencesAppStatusAccount = Pick<
  ConnectedAccount,
  'provider' | 'archivedAt' | 'authFailedAt' | 'applicationId'
> & {
  messageChannels: Pick<MessageChannel, 'type' | 'syncStatus' | 'syncStage'>[];
  calendarChannels: Pick<CalendarChannel, 'syncStatus' | 'syncStage'>[];
};
