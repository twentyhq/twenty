import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { SettingsPath } from '@/types/SettingsPath';

import { SettingsAccountsConnectedAccountsRowRightContainer } from '@/settings/accounts/components/SettingsAccountsConnectedAccountsRowRightContainer';
import { useLingui } from '@lingui/react/macro';

import { SettingsConnectedAccountIcon } from '@/settings/accounts/components/SettingsConnectedAccountIcon';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SettingsListCard } from '../../components/SettingsListCard';

export const SettingsAccountsConnectedAccountsListCard = ({
  accounts,
  loading,
}: {
  accounts: ConnectedAccount[];
  loading?: boolean;
}) => {
  const navigate = useNavigateSettings();
  const { t } = useLingui();

  if (!accounts.length) {
    return <SettingsAccountsListEmptyStateCard />;
  }

  return (
    <SettingsListCard
      items={accounts}
      getItemLabel={(account) => account.handle}
      isLoading={loading}
      RowIconFn={(row) => SettingsConnectedAccountIcon({ account: row })}
      RowRightComponent={({ item: account }) => (
        <SettingsAccountsConnectedAccountsRowRightContainer account={account} />
      )}
      hasFooter={true}
      footerButtonLabel={t`Add account`}
      onFooterButtonClick={() => navigate(SettingsPath.NewAccount)}
    />
  );
};
