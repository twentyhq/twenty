import { SettingsAccountGroupTableRow } from '@/settings/app-preferences/components/SettingsAccountGroupTableRow';
import { SettingsAppPreferencesListEmptyStateCard } from '@/settings/app-preferences/components/SettingsAppPreferencesListEmptyStateCard';
import { SETTINGS_ACCOUNT_GROUP_TABLE_GRID_TEMPLATE_COLUMNS } from '@/settings/app-preferences/constants/SettingsAccountGroupTableGridTemplateColumns';
import { SETTINGS_BUILT_IN_ACCOUNT_APP_ACCOUNT_GROUP_TABLE_GRID_TEMPLATE_COLUMNS } from '@/settings/app-preferences/constants/SettingsBuiltInAccountAppAccountGroupTableGridTemplateColumns';
import { useMyAccountGroups } from '@/settings/app-preferences/hooks/useMyAccountGroups';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { getBuiltInAccountAppsUsingAccount } from '@/settings/app-preferences/utils/getBuiltInAccountAppsUsingAccount';
import { SettingsTableRowsSkeletonLoader } from '@/settings/components/SettingsTableRowsSkeletonLoader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
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

type SettingsAccountGroupsSectionProps = {
  builtInAccountApp?: BuiltInAccountApp;
};

export const SettingsAccountGroupsSection = ({
  builtInAccountApp,
}: SettingsAccountGroupsSectionProps) => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { groups: allGroups, loading } = useMyAccountGroups();

  const groups = isDefined(builtInAccountApp)
    ? allGroups.filter((group) =>
        getBuiltInAccountAppsUsingAccount(group.builtInAccount).some(
          (app) => app.id === builtInAccountApp.id,
        ),
      )
    : allGroups;

  const gridTemplateColumns = isDefined(builtInAccountApp)
    ? SETTINGS_BUILT_IN_ACCOUNT_APP_ACCOUNT_GROUP_TABLE_GRID_TEMPLATE_COLUMNS
    : SETTINGS_ACCOUNT_GROUP_TABLE_GRID_TEMPLATE_COLUMNS;

  const tableHeaderRow = (
    <TableRow gridTemplateColumns={gridTemplateColumns}>
      <TableHeader>{t`Account`}</TableHeader>
      {isDefined(builtInAccountApp) ? (
        <TableHeader>{t`Permissions`}</TableHeader>
      ) : (
        <TableHeader align="right">{t`Used by`}</TableHeader>
      )}
      <TableHeader />
    </TableRow>
  );

  return (
    <Section.Root>
      <Section.Header
        title={t`Accounts`}
        description={t`Shared accounts between apps`}
      />
      {loading ? (
        <Table>
          {tableHeaderRow}
          <SettingsTableRowsSkeletonLoader
            gridTemplateColumns={gridTemplateColumns}
            columns={[
              {},
              isDefined(builtInAccountApp)
                ? { width: 140 }
                : { align: 'right', width: 48 },
              {},
            ]}
          />
        </Table>
      ) : groups.length === 0 ? (
        <SettingsAppPreferencesListEmptyStateCard
          provider={builtInAccountApp?.provider}
        />
      ) : (
        <>
          <Table>
            {tableHeaderRow}
            <StyledTableRows>
              {groups.map((group) => (
                <SettingsAccountGroupTableRow
                  key={group.id}
                  group={group}
                  gridTemplateColumns={gridTemplateColumns}
                  builtInAccountApp={builtInAccountApp}
                />
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
