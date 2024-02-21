import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import useI18n from '@/ui/i18n/useI18n';
import { Section } from '@/ui/layout/section/components/Section';

import { SettingsAccountsCard } from './SettingsAccountsCard';
import { SettingsAccountsEmptyStateCard } from './SettingsAccountsEmptyStateCard';

export const SettingsAccountsConnectedAccountsSection = ({
  accounts,
}: {
  accounts: ConnectedAccount[];
}) => {
  const { translate } = useI18n('translations');
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
      {accounts?.length ? (
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
