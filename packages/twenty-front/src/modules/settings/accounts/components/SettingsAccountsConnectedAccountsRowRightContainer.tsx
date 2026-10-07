import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsConnectionStatus } from '@/settings/accounts/components/SettingsAccountsConnectionStatus';
import { SettingsAccountsRowDropdownMenu } from '@/settings/accounts/components/SettingsAccountsRowDropdownMenu';
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
}) => {
  return (
    <StyledRowRightContainer>
      <SettingsAccountsConnectionStatus account={account} />
      <SettingsAccountsRowDropdownMenu account={account} />
    </StyledRowRightContainer>
  );
};
