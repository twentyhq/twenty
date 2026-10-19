import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { type NativeAccountApp } from '@/settings/app-preferences/types/NativeAccountApp';
import { getConnectedAccountSettingsChannels } from '@/settings/app-preferences/utils/getConnectedAccountSettingsChannels';
import { isDefined } from 'twenty-shared/utils';

type AccountWithChannels = {
  messageChannels: Pick<MessageChannel, 'type' | 'syncStage'>[];
  calendarChannels: Pick<CalendarChannel, 'syncStage'>[];
};

type GetNativeAccountAppChannelTabsVisibilityArgs = {
  app: Pick<NativeAccountApp, 'hasEmails' | 'hasCalendar'> | undefined;
  accounts: AccountWithChannels[];
  isLoading: boolean;
};

type IsChannelTabVisibleArgs = {
  isSupported: boolean;
  hasReadyChannel: boolean;
  hasPendingSetupChannel: boolean;
  hasAccounts: boolean;
  isLoading: boolean;
};

// A tab only offers to connect when no account exists; setup and reconnection live in the account row menu.
// Accounts load before their channels, so a missing channel only hides the tab once loading is done.
const isChannelTabVisible = ({
  isSupported,
  hasReadyChannel,
  hasPendingSetupChannel,
  hasAccounts,
  isLoading,
}: IsChannelTabVisibleArgs) => {
  if (!isSupported) {
    return false;
  }

  if (hasReadyChannel) {
    return true;
  }

  if (hasPendingSetupChannel) {
    return false;
  }

  return isLoading || !hasAccounts;
};

export const getNativeAccountAppChannelTabsVisibility = ({
  app,
  accounts,
  isLoading,
}: GetNativeAccountAppChannelTabsVisibilityArgs) => {
  if (!isDefined(app)) {
    return { isEmailsTabVisible: false, isCalendarTabVisible: false };
  }

  const channels = accounts.map(getConnectedAccountSettingsChannels);
  const hasAccounts = accounts.length > 0;

  return {
    isEmailsTabVisible: isChannelTabVisible({
      isSupported: app.hasEmails,
      hasReadyChannel: channels.some(({ messageChannel }) =>
        isDefined(messageChannel),
      ),
      hasPendingSetupChannel: channels.some(({ pendingSetupMessageChannel }) =>
        isDefined(pendingSetupMessageChannel),
      ),
      hasAccounts,
      isLoading,
    }),
    isCalendarTabVisible: isChannelTabVisible({
      isSupported: app.hasCalendar,
      hasReadyChannel: channels.some(({ calendarChannel }) =>
        isDefined(calendarChannel),
      ),
      hasPendingSetupChannel: channels.some(({ pendingSetupCalendarChannel }) =>
        isDefined(pendingSetupCalendarChannel),
      ),
      hasAccounts,
      isLoading,
    }),
  };
};
