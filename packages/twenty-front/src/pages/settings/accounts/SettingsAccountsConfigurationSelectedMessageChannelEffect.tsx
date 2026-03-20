import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { settingsAccountsSelectedMessageChannelState } from '@/settings/accounts/states/settingsAccountsSelectedMessageChannelState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

type SettingsAccountsConfigurationSelectedMessageChannelEffectProps = {
  messageChannel: MessageChannel | undefined;
};

export const SettingsAccountsConfigurationSelectedMessageChannelEffect = ({
  messageChannel,
}: SettingsAccountsConfigurationSelectedMessageChannelEffectProps) => {
  const setSettingsAccountsSelectedMessageChannel = useSetAtomState(
    settingsAccountsSelectedMessageChannelState,
  );

  useEffect(() => {
    if (isDefined(messageChannel)) {
      setSettingsAccountsSelectedMessageChannel(messageChannel);
    }
  }, [messageChannel, setSettingsAccountsSelectedMessageChannel]);

  return null;
};
