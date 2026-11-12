import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsRowDropdownMenu } from '@/settings/accounts/components/SettingsAccountsRowDropdownMenu';
import { SettingsConnectedAccountSyncStatus } from '@/settings/app-preferences/components/SettingsConnectedAccountSyncStatus';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
`;

export const SettingsAccountsConnectedAccountsRowRightContainer = ({
  account,
  action = <SettingsAccountsRowDropdownMenu account={account} />,
}: {
  account: ConnectedAccount;
  action?: ReactNode;
}) => (
  <StyledRowRightContainer>
    <SettingsConnectedAccountSyncStatus account={account} />
    {action}
  </StyledRowRightContainer>
);
