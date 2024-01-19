import { useRecoilValue } from 'recoil';

import { Account } from '@/accounts/types/Account';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import useI18n from '@/ui/i18n/useI18n';
import { Section } from '@/ui/layout/section/components/Section';

import { SettingsAccountsCard } from './SettingsAccountsCard';
import { SettingsAccountsEmptyStateCard } from './SettingsAccountsEmptyStateCard';

export const SettingsAccountsConnectedAccountsSection = () => {
  const { translate } = useI18n('translations');
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const accounts = useFindManyRecords<Account>({
    objectNameSingular: 'connectedAccount',
    filter: {
      accountOwnerId: {
        eq: currentWorkspaceMember?.id,
      },
    },
  }).records;

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: 'connectedAccount',
  });

  const handleAccountRemove = (idToRemove: string) =>
    deleteOneRecord(idToRemove);

  return (
    <Section>
      <H2Title
        title={translate('connectedAccounts')}
        description={translate('manageYourInternetAccounts')}
      />
      {accounts.length ? (
        <SettingsAccountsCard
          accounts={accounts}
          onAccountRemove={handleAccountRemove}
        />
      ) : (
        <SettingsAccountsEmptyStateCard />
      )}
    </Section>
  );
};
