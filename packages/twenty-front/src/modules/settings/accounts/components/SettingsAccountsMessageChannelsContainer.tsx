import { styled } from '@linaria/react';

import { SettingsAccountsMessageChannelDetails } from '@/settings/accounts/components/SettingsAccountsMessageChannelDetails';
import { SettingsAccountsSelectedMessageChannelEffect } from '@/settings/accounts/components/SettingsAccountsSelectedMessageChannelEffect';
import { SettingsNewAccountSection } from '@/settings/accounts/components/SettingsNewAccountSection';
import { SETTINGS_ACCOUNT_MESSAGE_CHANNELS_TAB_LIST_COMPONENT_ID } from '@/settings/accounts/constants/SettingsAccountMessageChannelsTabListComponentId';
import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';
import { settingsAccountsSelectedMessageChannelState } from '@/settings/accounts/states/settingsAccountsSelectedMessageChannelState';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import React, { useCallback } from 'react';
import { MessageChannelSyncStage } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledMessageContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[6]};
`;

export const SettingsAccountsMessageChannelsContainer = () => {
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    SETTINGS_ACCOUNT_MESSAGE_CHANNELS_TAB_LIST_COMPONENT_ID,
  );
  const setSettingsAccountsSelectedMessageChannel = useSetAtomState(
    settingsAccountsSelectedMessageChannelState,
  );

  const { channels: allMessageChannels } = useMyMessageChannels();

  const messageChannels = allMessageChannels.filter(
    (channel) =>
      channel.isSyncEnabled &&
      channel.syncStage !== MessageChannelSyncStage.PENDING_CONFIGURATION,
  );

  const tabs = messageChannels.map((messageChannel) => ({
    id: messageChannel.id,
    title: messageChannel.handle,
  }));

  const handleTabChange = useCallback(
    (tabId: string) => {
      const selectedMessageChannel = messageChannels.find(
        (channel) => channel.id === tabId,
      );
      if (isDefined(selectedMessageChannel)) {
        setSettingsAccountsSelectedMessageChannel(selectedMessageChannel);
      }
    },
    [messageChannels, setSettingsAccountsSelectedMessageChannel],
  );

  if (!messageChannels.length) {
    return <SettingsNewAccountSection />;
  }

  return (
    <>
      <SettingsAccountsSelectedMessageChannelEffect
        messageChannels={messageChannels}
      />
      {tabs.length > 1 && (
        <StyledMessageContainer>
          <TabList
            tabs={tabs}
            componentInstanceId={
              SETTINGS_ACCOUNT_MESSAGE_CHANNELS_TAB_LIST_COMPONENT_ID
            }
            onChangeTab={handleTabChange}
          />
        </StyledMessageContainer>
      )}
      {messageChannels.map((messageChannel) => (
        <React.Fragment key={messageChannel.id}>
          {(messageChannels.length === 1 ||
            messageChannel.id === activeTabId) && (
            <SettingsAccountsMessageChannelDetails
              messageChannel={messageChannel}
            />
          )}
        </React.Fragment>
      ))}
    </>
  );
};
