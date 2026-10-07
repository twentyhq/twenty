import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { type BuiltInApp } from '@/settings/app-preferences/types/BuiltInApp';
import { MessageChannelType } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const isAccountUsedByBuiltInApp = ({
  account,
  builtInApp,
}: {
  account: Pick<
    ConnectedAccount,
    'provider' | 'messageChannels' | 'calendarChannels'
  >;
  builtInApp: Pick<BuiltInApp, 'provider' | 'hasMessaging' | 'hasCalendar'>;
}) =>
  account.provider === builtInApp.provider &&
  ((builtInApp.hasMessaging &&
    account.messageChannels.some(
      (channel) => channel.type === MessageChannelType.EMAIL,
    )) ||
    (builtInApp.hasCalendar && isNonEmptyArray(account.calendarChannels)));
