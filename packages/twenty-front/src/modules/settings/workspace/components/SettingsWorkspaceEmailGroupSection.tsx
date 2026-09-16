import { useLingui } from '@lingui/react/macro';

import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { useIsInboxEnabled } from '@/inbox/hooks/useIsInboxEnabled';
import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';
import {
  SettingsTableListSection,
  type SettingsTableListSectionColumn,
} from '@/settings/components/SettingsTableListSection';
import { SettingsWorkspaceEmailChannelDomainStatusCell } from '@/settings/workspace/components/SettingsWorkspaceEmailChannelDomainStatusCell';
import { SettingsWorkspaceEmailGroupInboxQueueCell } from '@/settings/workspace/components/SettingsWorkspaceEmailGroupInboxQueueCell';
import { SettingsWorkspaceEmailGroupSourceCell } from '@/settings/workspace/components/SettingsWorkspaceEmailGroupSourceCell';
import { MessageChannelType, SettingsPath } from 'twenty-shared/types';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsWorkspaceEmailGroupSection = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { channels } = useMyMessageChannels();
  const isInboxEnabled = useIsInboxEnabled();

  const emailGroupChannels = channels.filter(
    (channel) => channel.type === MessageChannelType.EMAIL_GROUP,
  );

  const columns: SettingsTableListSectionColumn<MessageChannel>[] = [
    { label: t`Email`, Cell: SettingsWorkspaceEmailGroupSourceCell },
    ...(isInboxEnabled
      ? [
          {
            label: t`Goes to`,
            align: 'right' as const,
            Cell: SettingsWorkspaceEmailGroupInboxQueueCell,
          },
        ]
      : []),
    {
      label: t`Domain`,
      align: 'right',
      Cell: SettingsWorkspaceEmailChannelDomainStatusCell,
    },
  ];

  return (
    <SettingsTableListSection<MessageChannel>
      title={t`Channels`}
      description={t`Addresses your workspace uses to send and receive email from shared inboxes`}
      items={emailGroupChannels}
      columns={columns}
      gridAutoColumns={isInboxEnabled ? '1fr 1fr 1fr' : '1fr 1fr'}
      showRowChevron
      onRowClick={(channel) =>
        navigateSettings(SettingsPath.EmailGroupChannelDetail, {
          messageChannelId: channel.id,
        })
      }
      footerButtonLabel={t`Add email channel`}
      onFooterButtonClick={() =>
        navigateSettings(SettingsPath.NewEmailGroupChannel)
      }
    />
  );
};
