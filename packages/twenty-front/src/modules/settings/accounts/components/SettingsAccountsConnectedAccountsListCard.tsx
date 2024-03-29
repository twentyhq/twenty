import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { Pill } from 'twenty-ui';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { SettingsAccountsRowDropdownMenu } from '@/settings/accounts/components/SettingsAccountsRowDropdownMenu';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { IconGoogle } from '@/ui/display/icon/components/IconGoogle';

import { SettingsListCard } from '../../components/SettingsListCard';

const StyledPill = styled(Pill)`
  background-color: ${({ theme }) => theme.background.danger};
  color: ${({ theme }) => theme.font.color.danger};
  font-size: ${({ theme }) => theme.font.size.md};
  font-style: normal;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: ${({ theme }) => theme.spacing(5)};
`;

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
          {account.authFailedAt && <StyledPill label="Sync failed" />}
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
