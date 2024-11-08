import { useNavigate } from 'react-router-dom';
import { IconComponent, IconGoogle, IconMicrosoft } from 'twenty-ui';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';

import { SettingsAccountsConnectedAccountsRowRightContainer } from '@/settings/accounts/components/SettingsAccountsConnectedAccountsRowRightContainer';
import { SettingsListCard } from '../../components/SettingsListCard';

const ProviderIcons: { [k: string]: IconComponent } = {
  google: IconGoogle,
  microsoft: IconMicrosoft,
};

export const SettingsAccountsConnectedAccountsListCard = ({
  accounts,
  loading,
}: {
  accounts: ConnectedAccount[];
  loading?: boolean;
}) => {
  const navigate = useNavigate();

  if (!accounts.length) {
    return <SettingsAccountsListEmptyStateCard />;
  }

  return (
    <SettingsListCard
      items={accounts}
      getItemLabel={(account) => account.handle}
      isLoading={loading}
      RowIconFn={(row) => ProviderIcons[row.provider]}
      RowRightComponent={({ item: account }) => (
        <SettingsAccountsConnectedAccountsRowRightContainer account={account} />
      )}
      hasFooter
      footerButtonLabel="Add account"
      onFooterButtonClick={() =>
        navigate(getSettingsPagePath(SettingsPath.NewAccount))
      }
    />
  );
};
