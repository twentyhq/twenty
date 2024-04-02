import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { SettingsAccountsRowDropdownMenu } from '@/settings/accounts/components/SettingsAccountsRowDropdownMenu';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { IconGoogle } from '@/ui/display/icon/components/IconGoogle';
import { Status } from '@/ui/display/status/components/Status';

import { SettingsListCard } from '../../components/SettingsListCard';

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
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
        <StyledRowRightContainer>
          {account.authFailedAt && (
            <Status color="red" text="Sync failed" weight="medium" />
          )}
          <SettingsAccountsRowDropdownMenu account={account} />
        </StyledRowRightContainer>
      )}
      hasFooter
      footerButtonLabel="Add account"
      onFooterButtonClick={() =>
        navigate(getSettingsPagePath(SettingsPath.NewAccount))
      }
    />
  );
};
