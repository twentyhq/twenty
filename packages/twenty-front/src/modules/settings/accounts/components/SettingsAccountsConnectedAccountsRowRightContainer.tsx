import { ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsRowDropdownMenu } from '@/settings/accounts/components/SettingsAccountsRowDropdownMenu';
import { SyncStatus } from '@/settings/accounts/enums/syncStatus.enum';
import { computeSyncStatus } from '@/settings/accounts/utils/computeSyncStatus.util';
import { Status } from '@/ui/display/status/components/Status';
import styled from '@emotion/styled';

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

  const status = computeSyncStatus(mCSyncStatus, cCSyncStatus);

  return (
    <StyledRowRightContainer>
      {status === SyncStatus.FAILED && (
        <Status color="red" text="Sync failed" weight="medium" />
      )}
      {status === SyncStatus.SYNCED && (
        <Status color="green" text="Synced" weight="medium" />
      )}
      {status === SyncStatus.NOT_SYNCED && (
        <Status color="orange" text="Not synced" weight="medium" />
      )}
      {status === SyncStatus.IMPORTING && (
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
