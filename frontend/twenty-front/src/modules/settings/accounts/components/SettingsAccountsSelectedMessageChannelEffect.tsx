import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { SETTINGS_ACCOUNT_MESSAGE_CHANNELS_TAB_LIST_COMPONENT_ID } from '@/settings/accounts/constants/SettingsAccountMessageChannelsTabListComponentId';
import { settingsAccountsSelectedMessageChannelState } from '@/settings/accounts/states/settingsAccountsSelectedMessageChannelState';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';

type SettingsAccountsSelectedMessageChannelEffectProps = {
  messageChannels: MessageChannel[];
};

export const SettingsAccountsSelectedMessageChannelEffect = ({
  messageChannels,
}: SettingsAccountsSelectedMessageChannelEffectProps) => {
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    SETTINGS_ACCOUNT_MESSAGE_CHANNELS_TAB_LIST_COMPONENT_ID,
  );

  const setSettingsAccountsSelectedMessageChannel = useSetAtomState(
    settingsAccountsSelectedMessageChannelState,
  );

  useEffect(() => {
    if (messageChannels.length === 0) {
      return;
    }

    const currentSelectionStillExists = activeTabId
      ? messageChannels.some((channel) => channel.id === activeTabId)
      : false;

    if (!currentSelectionStillExists) {
      setSettingsAccountsSelectedMessageChannel(messageChannels[0]);
    }
  }, [messageChannels, activeTabId, setSettingsAccountsSelectedMessageChannel]);

  return null;
};
