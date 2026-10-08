import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsRowDropdownMenu } from '@/settings/accounts/components/SettingsAccountsRowDropdownMenu';
import { SettingsConnectedAccountSyncStatus } from '@/settings/accounts/components/SettingsConnectedAccountSyncStatus';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
`;

export const SettingsAccountsConnectedAccountsRowRightContainer = ({
  account,
}: {
  account: ConnectedAccount;
}) => (
  <StyledRowRightContainer>
    <SettingsConnectedAccountSyncStatus account={account} />
    <SettingsAccountsRowDropdownMenu account={account} />
  </StyledRowRightContainer>
);
