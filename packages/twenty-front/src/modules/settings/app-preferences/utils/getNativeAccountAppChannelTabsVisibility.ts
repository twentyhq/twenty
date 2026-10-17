import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { type NativeAccountApp } from '@/settings/app-preferences/types/NativeAccountApp';
import { getConnectedAccountSettingsChannels } from '@/settings/app-preferences/utils/getConnectedAccountSettingsChannels';
import { isDefined } from 'twenty-shared/utils';

type AccountWithChannels = {
  messageChannels: Pick<MessageChannel, 'type' | 'syncStage'>[];
  calendarChannels: Pick<CalendarChannel, 'syncStage'>[];
};

// A tab whose accounts are all pending setup is hidden: setup lives in the account row menu
export const getNativeAccountAppChannelTabsVisibility = (
  app: Pick<NativeAccountApp, 'hasEmails' | 'hasCalendar'> | undefined,
  accounts: AccountWithChannels[],
) => {
  const channels = accounts.map(getConnectedAccountSettingsChannels);

  const isVisible = (
    isSupported: boolean | undefined,
    hasReadyChannel: boolean,
    hasPendingSetupChannel: boolean,
  ) => isSupported === true && (hasReadyChannel || !hasPendingSetupChannel);

  return {
    isEmailsTabVisible: isVisible(
      app?.hasEmails,
      channels.some(({ messageChannel }) => isDefined(messageChannel)),
      channels.some(({ pendingSetupMessageChannel }) =>
        isDefined(pendingSetupMessageChannel),
      ),
    ),
    isCalendarTabVisible: isVisible(
      app?.hasCalendar,
      channels.some(({ calendarChannel }) => isDefined(calendarChannel)),
      channels.some(({ pendingSetupCalendarChannel }) =>
        isDefined(pendingSetupCalendarChannel),
      ),
    ),
  };
};
