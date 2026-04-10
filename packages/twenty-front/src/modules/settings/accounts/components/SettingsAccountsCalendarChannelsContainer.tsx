import { styled } from '@linaria/react';

import { SettingsAccountsCalendarChannelDetails } from '@/settings/accounts/components/SettingsAccountsCalendarChannelDetails';
import { SettingsNewAccountSection } from '@/settings/accounts/components/SettingsNewAccountSection';
import { SETTINGS_ACCOUNT_CALENDAR_CHANNELS_TAB_LIST_COMPONENT_ID } from '@/settings/accounts/constants/SettingsAccountCalendarChannelsTabListComponentId';
import { useMyCalendarChannels } from '@/settings/accounts/hooks/useMyCalendarChannels';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import React from 'react';
import { CalendarChannelSyncStage } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCalenderContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[6]};
`;

export const SettingsAccountsCalendarChannelsContainer = () => {
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    SETTINGS_ACCOUNT_CALENDAR_CHANNELS_TAB_LIST_COMPONENT_ID,
  );

  const { channels: allCalendarChannels } = useMyCalendarChannels();

  const calendarChannels = allCalendarChannels.filter(
    (channel) =>
      channel.syncStage !== CalendarChannelSyncStage.PENDING_CONFIGURATION,
  );

  const tabs = [
    ...calendarChannels.map((calendarChannel) => ({
      id: calendarChannel.id,
      title: calendarChannel.handle,
    })),
  ];

  if (!calendarChannels.length) {
    return <SettingsNewAccountSection />;
  }

  return (
    <>
      {tabs.length > 1 && (
        <StyledCalenderContainer>
          <TabList
            tabs={tabs}
            componentInstanceId={
              SETTINGS_ACCOUNT_CALENDAR_CHANNELS_TAB_LIST_COMPONENT_ID
            }
          />
        </StyledCalenderContainer>
      )}
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
      {/* TODO: remove or keep? */}
      {/* {activeTabId === 'general' && (
        <SettingsAccountsCalendarChannelsGeneral />
      )} */}
    </>
  );
};
