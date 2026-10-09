import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { SettingsAppPreferencesMessageChannelDetails } from '@/settings/app-preferences/components/SettingsAppPreferencesMessageChannelDetails';
import { settingsAccountsSelectedMessageChannelState } from '@/settings/accounts/states/settingsAccountsSelectedMessageChannelState';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsAccountsConfigurationSelectedMessageChannelEffect } from '~/pages/settings/accounts/SettingsAccountsConfigurationSelectedMessageChannelEffect';

type SettingsAppPreferencesSelectedMessageChannelDetailsProps = {
  messageChannel: MessageChannel;
};

export const SettingsAppPreferencesSelectedMessageChannelDetails = ({
  messageChannel,
}: SettingsAppPreferencesSelectedMessageChannelDetailsProps) => {
  const settingsAccountsSelectedMessageChannel = useAtomStateValue(
    settingsAccountsSelectedMessageChannelState,
  );

  return (
    <>
      <SettingsAccountsConfigurationSelectedMessageChannelEffect
        messageChannel={messageChannel}
      />
      {settingsAccountsSelectedMessageChannel?.id === messageChannel.id ? (
        <SettingsAppPreferencesMessageChannelDetails
          messageChannel={messageChannel}
        />
      ) : (
        <SettingsSectionSkeletonLoader />
      )}
    </>
  );
};
