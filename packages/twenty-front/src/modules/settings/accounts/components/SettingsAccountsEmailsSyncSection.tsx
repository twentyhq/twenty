import { useRecoilValue } from 'recoil';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { MessageChannel } from '@/accounts/types/MessageChannel';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Section } from '@/ui/layout/section/components/Section';
import useI18n from '@/ui/i18n/useI18n';

import { SettingsAccountsEmailsCard } from './SettingsAccountsEmailsCard';
import { SettingsAccountsEmptyStateCard } from './SettingsAccountsEmptyStateCard';

export const SettingsAccountsEmailsSyncSection = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { translate } = useI18n('translations');

  const accounts = useFindManyRecords<ConnectedAccount>({
    objectNameSingular: 'connectedAccount',
    filter: {
      accountOwnerId: {
        eq: currentWorkspaceMember?.id,
      },
    },
  }).records;

  const messageChannels = useFindManyRecords<MessageChannel>({
    objectNameSingular: 'messageChannel',
    filter: {
      connectedAccountId: {
        in: accounts.map((account) => account.id),
      },
    },
  }).records;

  const messageChannelsWithSyncedEmails = messageChannels.map(
    (messageChannel) => ({
      ...messageChannel,
      isSynced: true,
    }),
  );

  return (
    <Section>
      <H2Title
        title={translate('emailsSync')}
        description={translate('emailsSyncDes')}
      />
      {accounts.length ? (
        <SettingsAccountsEmailsCard
          messageChannels={messageChannelsWithSyncedEmails}
        />
      ) : (
        <SettingsAccountsEmptyStateCard />
      )}
    </Section>
  );
};
