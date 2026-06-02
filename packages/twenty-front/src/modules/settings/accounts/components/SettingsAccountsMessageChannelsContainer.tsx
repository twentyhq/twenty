import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { SettingsAccountsMessageChannelDetails } from '@/settings/accounts/components/SettingsAccountsMessageChannelDetails';
import { SettingsAccountsSelectedMessageChannelEffect } from '@/settings/accounts/components/SettingsAccountsSelectedMessageChannelEffect';
import { SETTINGS_ACCOUNT_MESSAGE_CHANNELS_TAB_LIST_COMPONENT_ID } from '@/settings/accounts/constants/SettingsAccountMessageChannelsTabListComponentId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import React from 'react';

type SettingsAccountsMessageChannelsContainerProps = {
  messageChannels: MessageChannel[];
};

export const SettingsAccountsMessageChannelsContainer = ({
  messageChannels,
}: SettingsAccountsMessageChannelsContainerProps) => {
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    SETTINGS_ACCOUNT_MESSAGE_CHANNELS_TAB_LIST_COMPONENT_ID,
  );

  return (
    <>
      <SettingsAccountsSelectedMessageChannelEffect
        messageChannels={messageChannels}
      />
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
