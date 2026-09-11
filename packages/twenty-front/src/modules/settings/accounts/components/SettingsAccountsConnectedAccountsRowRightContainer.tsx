import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsRowDropdownMenu } from '@/settings/accounts/components/SettingsAccountsRowDropdownMenu';
import { SyncStatus } from '@/settings/accounts/constants/SyncStatus';
import { computeSyncStatus } from '@/settings/accounts/utils/computeSyncStatus';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Status } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
`;

export const SettingsAccountsConnectedAccountsRowRightContainer = ({
  account,
}: {
  account: ConnectedAccount;
}) => {
  const messageChannel = account.messageChannels[0];
  const calendarChannel = account.calendarChannels[0];

  const isArchived = isDefined(account.archivedAt);

  const status = computeSyncStatus(messageChannel, calendarChannel);

  // Archived accounts are frozen (owner left the workspace): their synced data
  // is kept but sync is disabled, so the live sync status is no longer relevant.
  if (isArchived) {
    return (
      <StyledRowRightContainer>
        <Status color="gray" weight="medium">{t`Archived`}</Status>
        <SettingsAccountsRowDropdownMenu account={account} />
      </StyledRowRightContainer>
    );
  }

  return (
    <StyledRowRightContainer>
      {status === SyncStatus.FAILED && (
        <Status color="red" weight="medium">{t`Sync failed`}</Status>
      )}
      {status === SyncStatus.SYNCED && (
        <Status color="green" weight="medium">{t`Synced`}</Status>
      )}
      {status === SyncStatus.NOT_SYNCED && (
        <Status color="orange" weight="medium">{t`Not synced`}</Status>
      )}
      {status === SyncStatus.IMPORTING && (
        <Status
          color="turquoise"
          weight="medium"
          loading
        >{t`Importing`}</Status>
      )}
      {status === SyncStatus.PENDING_CONFIGURATION && (
        <Status color="orange" weight="medium">{t`Setup incomplete`}</Status>
      )}
      <SettingsAccountsRowDropdownMenu account={account} />
    </StyledRowRightContainer>
  );
};
