import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { SETTINGS_ACCOUNT_MESSAGE_CHANNELS_TAB_LIST_COMPONENT_ID } from '@/settings/accounts/constants/SettingsAccountMessageChannelsTabListComponentId';
import { settingsAccountsSelectedMessageChannelState } from '@/settings/accounts/states/settingsAccountsSelectedMessageChannelState';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';

type SettingsAccountsSelectedMessageChannelEffectProps = {
  messageChannels: MessageChannel[];
};

export const SettingsAccountsSelectedMessageChannelEffect = ({
  messageChannels,
}: SettingsAccountsSelectedMessageChannelEffectProps) => {
  const activeTabId = useSettingsActiveTabId(
    SETTINGS_ACCOUNT_MESSAGE_CHANNELS_TAB_LIST_COMPONENT_ID,
    messageChannels.map((channel) => channel.id),
  );

  const setSettingsAccountsSelectedMessageChannel = useSetAtomState(
    settingsAccountsSelectedMessageChannelState,
  );

  useEffect(() => {
    if (messageChannels.length === 0) {
      return;
    }

    const activeChannel = messageChannels.find(
      (channel) => channel.id === activeTabId,
    );

    setSettingsAccountsSelectedMessageChannel(
      activeChannel ?? messageChannels[0],
    );
  }, [messageChannels, activeTabId, setSettingsAccountsSelectedMessageChannel]);

  return null;
};
