import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { CalendarChannel } from '@/accounts/types/CalendarChannel';
import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsAccountsCalendarChannelDetails } from '@/settings/accounts/components/SettingsAccountsCalendarChannelDetails';
import { SettingsAccountsCalendarChannelsGeneral } from '@/settings/accounts/components/SettingsAccountsCalendarChannelsGeneral';
import { SettingsNewAccountSection } from '@/settings/accounts/components/SettingsNewAccountSection';
import { SETTINGS_ACCOUNT_CALENDAR_CHANNELS_TAB_LIST_COMPONENT_ID } from '@/settings/accounts/constants/SettingsAccountCalendarChannelsTabListComponentId';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import React from 'react';

const StyledCalenderContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(6)};
`;

export const SettingsAccountsCalendarChannelsContainer = () => {
  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    SETTINGS_ACCOUNT_CALENDAR_CHANNELS_TAB_LIST_COMPONENT_ID,
  );
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
    skip: !accounts.length,
  });

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
      {false && activeTabId === 'general' && (
        <SettingsAccountsCalendarChannelsGeneral />
      )}
    </>
  );
};
