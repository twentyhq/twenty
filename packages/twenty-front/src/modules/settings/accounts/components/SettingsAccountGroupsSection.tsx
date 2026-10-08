import { SettingsAccountGroupTableRow } from '@/settings/accounts/components/SettingsAccountGroupTableRow';
import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { SETTINGS_ACCOUNT_GROUP_TABLE_GRID_TEMPLATE_COLUMNS } from '@/settings/accounts/constants/SettingsAccountGroupTableGridTemplateColumns';
import { useMyAccountGroups } from '@/settings/accounts/hooks/useMyAccountGroups';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { Section } from 'twenty-ui/components/layout';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledTableRows = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledAddAccountContainer = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[2]};
`;

export const SettingsAccountGroupsSection = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { groups, loading } = useMyAccountGroups();

  if (loading) {
    return <SettingsSectionSkeletonLoader />;
  }

  return (
    <Section.Root>
      <Section.Header
        title={t`Accounts`}
        description={t`Shared accounts between apps`}
      />
      {groups.length === 0 ? (
        <SettingsAccountsListEmptyStateCard />
      ) : (
        <>
          <Table>
            <TableRow
              gridTemplateColumns={
                SETTINGS_ACCOUNT_GROUP_TABLE_GRID_TEMPLATE_COLUMNS
              }
            >
              <TableHeader>{t`Account`}</TableHeader>
              <TableHeader align="right">{t`Used by`}</TableHeader>
              <TableHeader />
            </TableRow>
            <StyledTableRows>
              {groups.map((group) => (
                <SettingsAccountGroupTableRow key={group.id} group={group} />
              ))}
            </StyledTableRows>
          </Table>
          <StyledAddAccountContainer>
            <Button
              startIcon={<IconPlus />}
              size="sm"
              onClick={() => navigateSettings(SettingsPath.NewAccount)}
              variant="outline"
            >{t`Add account`}</Button>
          </StyledAddAccountContainer>
        </>
      )}
    </Section.Root>
  );
};
