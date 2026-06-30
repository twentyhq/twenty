import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { SettingsAccountsCalendarChannelDetails } from '@/settings/accounts/components/SettingsAccountsCalendarChannelDetails';
import { SETTINGS_ACCOUNT_CALENDAR_CHANNELS_TAB_LIST_COMPONENT_ID } from '@/settings/accounts/constants/SettingsAccountCalendarChannelsTabListComponentId';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import React from 'react';

type SettingsAccountsCalendarChannelsContainerProps = {
  calendarChannels: CalendarChannel[];
};

export const SettingsAccountsCalendarChannelsContainer = ({
  calendarChannels,
}: SettingsAccountsCalendarChannelsContainerProps) => {
  const activeTabId = useSettingsActiveTabId(
    SETTINGS_ACCOUNT_CALENDAR_CHANNELS_TAB_LIST_COMPONENT_ID,
    calendarChannels.map((channel) => channel.id),
  );

  return (
    <>
      {calendarChannels.map((calendarChannel) => (
        <React.Fragment key={calendarChannel.id}>
          {calendarChannel.id === activeTabId && (
            <SettingsAccountsCalendarChannelDetails
              calendarChannel={calendarChannel}
            />
          )}
        </React.Fragment>
      ))}
    </>
  );
};
