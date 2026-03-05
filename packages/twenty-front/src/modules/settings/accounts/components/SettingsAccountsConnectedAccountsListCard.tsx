import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { SettingsConnectedAccountsTableHeader } from '@/settings/accounts/components/SettingsConnectedAccountsTableHeader';
import { SettingsConnectedAccountsTableRow } from '@/settings/components/SettingsConnectedAccountsTableRow';
import { Table } from '@/ui/layout/table/components/Table';
import { styled } from '@linaria/react';
import { SettingsPath } from 'twenty-shared/types';

import { useLingui } from '@lingui/react/macro';
import { IconPlus } from 'twenty-ui/display';

import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledTableRows = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledAddAccountSectionContainer = styled.div`
  > * {
    border-top: 1px solid ${themeCssVariables.border.color.light};
    display: flex;
    justify-content: flex-end;
    padding-top: ${themeCssVariables.spacing[2]};
  }
`;

export const SettingsAccountsConnectedAccountsListCard = ({
  accounts,
}: {
  accounts: ConnectedAccount[];
}) => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();

  if (!accounts.length) {
    return <SettingsAccountsListEmptyStateCard />;
  }

  return (
    <Section>
      <Table>
        <SettingsConnectedAccountsTableHeader />
        <StyledTableRows>
          {accounts.map((account) => (
            <SettingsConnectedAccountsTableRow
              key={account.id}
              account={account}
            />
          ))}
        </StyledTableRows>
      </Table>
      <StyledAddAccountSectionContainer>
        <Section>
          <Button
            Icon={IconPlus}
            title={t`Add account`}
            variant="secondary"
            size="small"
            onClick={() => navigateSettings(SettingsPath.NewAccount)}
          />
        </Section>
      </StyledAddAccountSectionContainer>
    </Section>
  );
};
