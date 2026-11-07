import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';

import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { SettingsAccountsMessageFoldersCard } from '@/settings/accounts/components/message-folders/SettingsAccountsMessageFoldersCard';
import { GET_MY_MESSAGE_FOLDERS } from '@/settings/accounts/graphql/queries/getMyMessageFolders';
import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';
import { settingsAccountsSelectedMessageChannelState } from '@/settings/accounts/states/settingsAccountsSelectedMessageChannelState';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsAccountsConfigurationSelectedMessageChannelEffect } from '~/pages/settings/accounts/SettingsAccountsConfigurationSelectedMessageChannelEffect';

type SettingsApplicationConnectionMessageFoldersProps = {
  connectedAccountId: string;
};

export const SettingsApplicationConnectionMessageFolders = ({
  connectedAccountId,
}: SettingsApplicationConnectionMessageFoldersProps) => {
  const { t } = useLingui();
  const { channels } = useMyMessageChannels(connectedAccountId);
  const [messageChannel] = channels;

  const { data } = useQuery<{ myMessageFolders: MessageFolder[] }>(
    GET_MY_MESSAGE_FOLDERS,
    {
      variables: { messageChannelId: messageChannel?.id },
      skip: !isDefined(messageChannel),
    },
  );

  const settingsAccountsSelectedMessageChannel = useAtomStateValue(
    settingsAccountsSelectedMessageChannelState,
  );

  if (!isDefined(messageChannel) || !isNonEmptyArray(data?.myMessageFolders)) {
    return null;
  }

  return (
    <Section.Root>
      <Section.Header
        title={t`Folders`}
        description={t`Choose which folders this application imports`}
      />
      <SettingsAccountsConfigurationSelectedMessageChannelEffect
        messageChannel={messageChannel}
      />
      {settingsAccountsSelectedMessageChannel?.id === messageChannel.id ? (
        <SettingsAccountsMessageFoldersCard />
      ) : (
        <SettingsSectionSkeletonLoader />
      )}
    </Section.Root>
  );
};
