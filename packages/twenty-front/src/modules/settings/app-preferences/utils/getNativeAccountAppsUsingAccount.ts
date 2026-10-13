import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { NATIVE_ACCOUNT_APPS } from '@/settings/app-preferences/constants/NativeAccountApps';
import {
  type ConnectedAccountProvider,
  MessageChannelType,
} from 'twenty-shared/types';

export const getNativeAccountAppsUsingAccount = (
  account:
    | {
        provider: ConnectedAccountProvider;
        messageChannels: Pick<MessageChannel, 'type'>[];
        calendarChannels: Pick<CalendarChannel, 'syncStage'>[];
      }
    | undefined,
) => {
  const hasMailbox =
    account?.messageChannels.some(
      (channel) => channel.type === MessageChannelType.EMAIL,
    ) ?? false;
  const hasCalendar = (account?.calendarChannels.length ?? 0) > 0;

  return NATIVE_ACCOUNT_APPS.filter(
    (app) =>
      app.provider === account?.provider &&
      ((app.hasEmails && hasMailbox) || (app.hasCalendar && hasCalendar)),
  );
};
