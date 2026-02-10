import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsRowDropdownMenu } from '@/settings/accounts/components/SettingsAccountsRowDropdownMenu';
import { SyncStatus } from '@/settings/accounts/constants/SyncStatus';
import { computeSyncStatus } from '@/settings/accounts/utils/computeSyncStatus';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { Status } from 'twenty-ui/display';

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsAccountsConnectedAccountsRowRightContainer = ({
  account,
}: {
  account: ConnectedAccount;
}) => {
  const messageChannel = account.messageChannels[0];
  const calendarChannel = account.calendarChannels[0];

  const status = computeSyncStatus(messageChannel, calendarChannel);

  return (
    <StyledRowRightContainer>
      {status === SyncStatus.FAILED && (
        <Status color="red" text={t`Sync failed`} weight="medium" />
      )}
      {status === SyncStatus.SYNCED && (
        <Status color="green" text={t`Synced`} weight="medium" />
      )}
      {status === SyncStatus.NOT_SYNCED && (
        <Status color="orange" text={t`Not synced`} weight="medium" />
      )}
      {status === SyncStatus.IMPORTING && (
        <Status
          color="turquoise"
          text={t`Importing`}
          weight="medium"
          isLoaderVisible
        />
      )}
      {status === SyncStatus.PENDING_CONFIGURATION && (
        <Status color="orange" text={t`Setup incomplete`} weight="medium" />
      )}
      <SettingsAccountsRowDropdownMenu account={account} />
    </StyledRowRightContainer>
  );
};
