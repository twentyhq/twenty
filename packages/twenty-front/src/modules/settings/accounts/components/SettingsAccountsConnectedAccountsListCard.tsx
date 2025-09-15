import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { SettingsConnectedAccountsTableHeader } from '@/settings/accounts/components/SettingsConnectedAccountsTableHeader';
import { SettingsConnectedAccountsTableRow } from '@/settings/components/SettingsConnectedAccountsTableRow';
import { Table } from '@/ui/layout/table/components/Table';
import styled from '@emotion/styled';
import { SettingsPath } from 'twenty-shared/types';

import { useLingui } from '@lingui/react/macro';
import { IconPlus } from 'twenty-ui/display';

import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledTableRows = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledAddAccountSection = styled(Section)`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
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
      <StyledAddAccountSection>
        <Button
          Icon={IconPlus}
          title={t`Add account`}
          variant="secondary"
          size="small"
          onClick={() => navigateSettings(SettingsPath.NewAccount)}
        />
      </StyledAddAccountSection>
    </Section>
  );
};
