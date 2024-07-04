import { useTheme } from '@emotion/react';
import { Section } from '@react-email/components';
import { useRecoilValue } from 'recoil';
import {
  H2Title,
  IconHome,
  IconRefresh,
  IconTimelineEvent,
  IconUser,
} from 'twenty-ui';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { MessageChannel } from '@/accounts/types/MessageChannel';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsAccountsCardMedia } from '@/settings/accounts/components/SettingsAccountsCardMedia';
import { SettingsAccountsInboxVisibilitySettingsCard } from '@/settings/accounts/components/SettingsAccountsInboxVisibilitySettingsCard';
import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { SettingsAccountsSynchronizationStatusProps } from '@/settings/accounts/components/SettingsAccountsSynchronizationStatus';
import { SettingsAccountsToggleSettingCard } from '@/settings/accounts/components/SettingsAccountsToggleSettingCard';

export const SettingsAccountsMessageChannelsContainer = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const theme = useTheme();

  const { records: accounts } = useFindManyRecords<ConnectedAccount>({
    objectNameSingular: CoreObjectNameSingular.ConnectedAccount,
    filter: {
      accountOwnerId: {
        eq: currentWorkspaceMember?.id,
      },
    },
  });

  const { records: messageChannels } = useFindManyRecords<
    MessageChannel & {
      connectedAccount: ConnectedAccount;
    }
  >({
    objectNameSingular: CoreObjectNameSingular.MessageChannel,
    filter: {
      connectedAccountId: {
        in: accounts.map((account) => account.id),
      },
    },
  });

  const messageChannelsWithSyncedEmails: (MessageChannel & {
    connectedAccount: ConnectedAccount;
  } & SettingsAccountsSynchronizationStatusProps)[] = messageChannels.map(
    (messageChannel) => ({
      ...messageChannel,
      syncStatus: messageChannel.syncStatus,
    }),
  );

  const tabs = [
    {
      id: 'summary',
      title: 'Summary',
      Icon: IconHome,
    },
    {
      id: 'timeline',
      title: 'Timeline',
      Icon: IconTimelineEvent,
    },
  ];

  if (!messageChannelsWithSyncedEmails.length) {
    return <SettingsAccountsListEmptyStateCard />;
  }

  return (
    <>
      <Section>
        <H2Title
          title="Email visibility"
          description="Define what will be visible to other users in your workspace"
        />
        <SettingsAccountsInboxVisibilitySettingsCard
          value={messageChannel.visibility}
          onChange={handleVisibilityChange}
        />
      </Section>
      <Section>
        <H2Title
          title="Contact auto-creation"
          description="Automatically create contacts for people you’ve sent emails to"
        />
        <SettingsAccountsToggleSettingCard
          cardMedia={
            <SettingsAccountsCardMedia>
              <IconUser
                size={theme.icon.size.sm}
                stroke={theme.icon.stroke.lg}
              />
            </SettingsAccountsCardMedia>
          }
          title="Auto-creation"
          value={!!messageChannel.isContactAutoCreationEnabled}
          onToggle={handleContactAutoCreationToggle}
        />
      </Section>
      <Section>
        <H2Title
          title="Synchronization"
          description="Past and future emails will automatically be synced to this workspace"
        />
        <SettingsAccountsToggleSettingCard
          cardMedia={
            <SettingsAccountsCardMedia>
              <IconRefresh
                size={theme.icon.size.sm}
                stroke={theme.icon.stroke.lg}
              />
            </SettingsAccountsCardMedia>
          }
          title="Sync emails"
          value={!!messageChannel.isSyncEnabled}
          onToggle={handleIsSyncEnabledToggle}
        />
      </Section>
    </>
  );
};
