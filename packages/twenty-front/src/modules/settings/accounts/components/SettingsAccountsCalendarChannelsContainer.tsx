import { useRecoilValue } from 'recoil';

import { CalendarChannel } from '@/accounts/types/CalendarChannel';
import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsAccountsCalendarChannelDetails } from '@/settings/accounts/components/SettingsAccountsCalendarChannelDetails';
import { SettingsAccountsCalendarChannelsGeneral } from '@/settings/accounts/components/SettingsAccountsCalendarChannelsGeneral';
import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { SETTINGS_ACCOUNT_CALENDAR_CHANNELS_TAB_LIST_COMPONENT_ID } from '@/settings/accounts/constants/SettingsAccountCalendarChannelsTabListComponentId';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import React from 'react';

export const SettingsAccountsCalendarChannelsContainer = () => {
  const { activeTabIdState } = useTabList(
    SETTINGS_ACCOUNT_CALENDAR_CHANNELS_TAB_LIST_COMPONENT_ID,
  );
  const activeTabId = useRecoilValue(activeTabIdState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { records: accounts } = useFindManyRecords<ConnectedAccount>({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
    filter: {
      accountOwnerId: {
        eq: currentWorkspaceMember?.id,
      },
    },
  });

  const { records: calendarChannels } = useFindManyRecords<
    CalendarChannel & {
      connectedAccount: ConnectedAccount;
    }
  >({
    objectNameSingular: CoreObjectNameSingular.CalendarChannel,
    filter: {
      connectedAccountId: {
        in: accounts.map((account) => account.id),
      },
    },
  });

  const tabs = [
    ...calendarChannels.map((calendarChannel) => ({
      id: calendarChannel.id,
      title: calendarChannel.handle,
    })),
  ];

  if (!calendarChannels.length) {
    return <SettingsAccountsListEmptyStateCard />;
  }

  return (
    <>
      <TabList
        tabListId={SETTINGS_ACCOUNT_CALENDAR_CHANNELS_TAB_LIST_COMPONENT_ID}
        tabs={tabs}
      />
      {calendarChannels.map((calendarChannel) => (
        <React.Fragment key={calendarChannel.id}>
          {calendarChannel.id === activeTabId && (
            <SettingsAccountsCalendarChannelDetails
              calendarChannel={calendarChannel}
            />
          )}
        </React.Fragment>
      ))}
      {false && activeTabId === 'general' && (
        <SettingsAccountsCalendarChannelsGeneral />
      )}
    </>
  );
};
