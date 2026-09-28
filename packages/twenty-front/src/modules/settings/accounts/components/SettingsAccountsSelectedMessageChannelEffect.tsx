import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { SETTINGS_ACCOUNT_MESSAGE_CHANNELS_TAB_LIST_COMPONENT_ID } from '@/settings/accounts/constants/SettingsAccountMessageChannelsTabListComponentId';
import { settingsAccountsSelectedMessageChannelState } from '@/settings/accounts/states/settingsAccountsSelectedMessageChannelState';
import { useSettingsActiveTabId } from '@/settings/components/layout/useSettingsActiveTabId';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

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
    const activeChannel =
      messageChannels.find((channel) => channel.id === activeTabId) ??
      messageChannels[0];

    if (!isDefined(activeChannel)) {
      return;
    }

    setSettingsAccountsSelectedMessageChannel(activeChannel);
  }, [messageChannels, activeTabId, setSettingsAccountsSelectedMessageChannel]);

  return null;
};
