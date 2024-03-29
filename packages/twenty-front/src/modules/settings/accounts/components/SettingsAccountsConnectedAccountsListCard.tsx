import { useNavigate } from 'react-router-dom';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { SettingsAccountsRowDropdownMenu } from '@/settings/accounts/components/SettingsAccountsRowDropdownMenu';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { IconGoogle } from '@/ui/display/icon/components/IconGoogle';
import { Status } from '@/ui/display/status/components/Status';

import { SettingsListCard } from '../../components/SettingsListCard';

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
      RowIcon={IconGoogle}
      RowRightComponent={({ item: account }) => (
        <>
          {account.authFailedAt && <Status color="red" text="Sync failed" />}
          <SettingsAccountsRowDropdownMenu item={account} />
        </>
      )}
      hasFooter
      footerButtonLabel="Add account"
      onFooterButtonClick={() =>
        navigate(getSettingsPagePath(SettingsPath.NewAccount))
      }
    />
  );
};
