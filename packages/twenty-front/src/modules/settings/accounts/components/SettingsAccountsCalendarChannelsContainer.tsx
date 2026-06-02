import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { SettingsAccountsCalendarChannelDetails } from '@/settings/accounts/components/SettingsAccountsCalendarChannelDetails';
import { SETTINGS_ACCOUNT_CALENDAR_CHANNELS_TAB_LIST_COMPONENT_ID } from '@/settings/accounts/constants/SettingsAccountCalendarChannelsTabListComponentId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import React from 'react';

type SettingsAccountsCalendarChannelsContainerProps = {
  calendarChannels: CalendarChannel[];
};

export const SettingsAccountsCalendarChannelsContainer = ({
  calendarChannels,
}: SettingsAccountsCalendarChannelsContainerProps) => {
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    SETTINGS_ACCOUNT_CALENDAR_CHANNELS_TAB_LIST_COMPONENT_ID,
  );

  return (
    <>
      {calendarChannels.map((calendarChannel) => (
        <React.Fragment key={calendarChannel.id}>
          {(calendarChannels.length === 1 ||
            calendarChannel.id === activeTabId) && (
            <SettingsAccountsCalendarChannelDetails
              calendarChannel={calendarChannel}
            />
          )}
        </React.Fragment>
      ))}
    </>
  );
};
