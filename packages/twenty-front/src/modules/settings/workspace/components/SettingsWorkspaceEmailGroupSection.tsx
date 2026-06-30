import { useLingui } from '@lingui/react/macro';

import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { SettingsWorkspaceEmailChannelDomainStatusCell } from '@/settings/workspace/components/SettingsWorkspaceEmailChannelDomainStatusCell';
import { SettingsWorkspaceEmailGroupForwardingCell } from '@/settings/workspace/components/SettingsWorkspaceEmailGroupForwardingCell';
import { SettingsWorkspaceEmailGroupSourceCell } from '@/settings/workspace/components/SettingsWorkspaceEmailGroupSourceCell';
import { MessageChannelType, SettingsPath } from 'twenty-shared/types';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const SettingsWorkspaceEmailGroupSection = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { channels } = useMyMessageChannels();

  const emailGroupChannels = channels.filter(
    (channel) => channel.type === MessageChannelType.EMAIL_GROUP,
  );

  return (
    <SettingsTableListSection<MessageChannel>
      title={t`Email Channels`}
      description={t`Shared addresses your workspace uses to send and receive email.`}
      items={emailGroupChannels}
      columns={[
        { label: t`Source`, Cell: SettingsWorkspaceEmailGroupSourceCell },
        {
          label: t`Forwarding address`,
          Cell: SettingsWorkspaceEmailGroupForwardingCell,
        },
        {
          label: t`Domain`,
          align: 'right',
          Cell: SettingsWorkspaceEmailChannelDomainStatusCell,
        },
      ]}
      gridAutoColumns="1fr 1fr 1fr"
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
