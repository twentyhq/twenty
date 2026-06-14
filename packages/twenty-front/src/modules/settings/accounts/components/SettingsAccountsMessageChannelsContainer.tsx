import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { SettingsAccountsMessageChannelDetails } from '@/settings/accounts/components/SettingsAccountsMessageChannelDetails';
import { SettingsAccountsSelectedMessageChannelEffect } from '@/settings/accounts/components/SettingsAccountsSelectedMessageChannelEffect';
import { SETTINGS_ACCOUNT_MESSAGE_CHANNELS_TAB_LIST_COMPONENT_ID } from '@/settings/accounts/constants/SettingsAccountMessageChannelsTabListComponentId';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import React from 'react';

type SettingsAccountsMessageChannelsContainerProps = {
  messageChannels: MessageChannel[];
};

export const SettingsAccountsMessageChannelsContainer = ({
  messageChannels,
}: SettingsAccountsMessageChannelsContainerProps) => {
  const activeTabId = useSettingsActiveTabId(
    SETTINGS_ACCOUNT_MESSAGE_CHANNELS_TAB_LIST_COMPONENT_ID,
    messageChannels.map((channel) => channel.id),
  );

  return (
    <>
      <SettingsAccountsSelectedMessageChannelEffect
        messageChannels={messageChannels}
      />
      {messageChannels.map((messageChannel) => (
        <React.Fragment key={messageChannel.id}>
          {messageChannel.id === activeTabId && (
            <SettingsAccountsMessageChannelDetails
              messageChannel={messageChannel}
            />
          )}
        </React.Fragment>
      ))}
    </>
  );
};
