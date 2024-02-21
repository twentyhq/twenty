import { useRecoilValue } from 'recoil';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { MessageChannel } from '@/accounts/types/MessageChannel';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsAccountEmailsSkeletonCard } from '@/settings/accounts/components/SettingsAccountEmailsSkeletonCard';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Section } from '@/ui/layout/section/components/Section';
import useI18n from '@/ui/i18n/useI18n';

import { SettingsAccountsEmailsCard } from './SettingsAccountsEmailsCard';
import { SettingsAccountsEmptyStateCard } from './SettingsAccountsEmptyStateCard';

export const SettingsAccountsEmailsSyncSection = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { translate } = useI18n('translations');

  const { records: accounts, loading: accountsLoading } =
    useFindManyRecords<ConnectedAccount>({
      objectNameSingular: 'connectedAccount',
      filter: {
        accountOwnerId: {
          eq: currentWorkspaceMember?.id,
        },
      },
    });

  const { records: messageChannels, loading: messageChannelsLoading } =
    useFindManyRecords<MessageChannel>({
      objectNameSingular: 'messageChannel',
      filter: {
        connectedAccountId: {
          in: accounts.map((account) => account.id),
        },
      },
    });

  const messageChannelsWithSyncedEmails = messageChannels.map(
    (messageChannel) => ({
      ...messageChannel,
      isSynced: true,
    }),
  );

  const loading = accountsLoading || messageChannelsLoading;

  return (
    <Section>
      <H2Title
        title={translate('emailsSync')}
        description={translate('emailsSyncDes')}
      />

      {loading ? (
        <SettingsAccountEmailsSkeletonCard />
      ) : accounts.length ? (
        <SettingsAccountsEmailsCard
          messageChannels={messageChannelsWithSyncedEmails}
        />
      ) : (
        <SettingsAccountsEmptyStateCard />
      )}
    </Section>
  );
};
