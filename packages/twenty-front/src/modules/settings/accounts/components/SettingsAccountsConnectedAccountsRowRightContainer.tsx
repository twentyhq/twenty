import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsRowDropdownMenu } from '@/settings/accounts/components/SettingsAccountsRowDropdownMenu';
import { Status } from '@/ui/display/status/components/Status';
import styled from '@emotion/styled';
import { useMemo } from 'react';

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsAccountsConnectedAccountsRowRightContainer = ({
  account,
}: {
  account: ConnectedAccount;
}) => {
  const mCSyncStatus = account.messageChannels[0]?.syncStatus;
  const cCSyncStatus = account.calendarChannels[0]?.syncStatus;

  const status = useMemo(() => {
    if (mCSyncStatus === 'ACTIVE' && cCSyncStatus === 'ACTIVE') {
      return 'Synced';
    } else if (mCSyncStatus === 'NOT_SYNCED' && cCSyncStatus === 'NOT_SYNCED') {
      return 'Not synced';
    } else if (mCSyncStatus === 'ONGOING' || cCSyncStatus === 'ONGOING') {
      return 'Importing';
    } else if (
      mCSyncStatus === 'FAILED' ||
      mCSyncStatus === 'FAILED_INSUFFICIENT_PERMISSIONS' ||
      cCSyncStatus === 'FAILED' ||
      cCSyncStatus === 'FAILED_INSUFFICIENT_PERMISSIONS'
    ) {
      return 'Failed';
    }
    return '';
  }, [mCSyncStatus, cCSyncStatus]);

  return (
    <StyledRowRightContainer>
      {status === 'Failed' && (
        <Status color="red" text="Sync failed" weight="medium" />
      )}
      {status === 'Synced' && (
        <Status color="green" text="Synced" weight="medium" />
      )}
      {status === 'Not synced' && (
        <Status color="orange" text="Not synced" weight="medium" />
      )}
      {status === 'Importing' && (
        <Status
          color="turquoise"
          text="Importing"
          weight="medium"
          isLoaderVisible
        />
      )}
      <SettingsAccountsRowDropdownMenu account={account} />
    </StyledRowRightContainer>
  );
};
