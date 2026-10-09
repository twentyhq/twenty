import { SettingsAccountGroupTableRow } from '@/settings/app-preferences/components/SettingsAccountGroupTableRow';
import { SettingsAppPreferencesListEmptyStateCard } from '@/settings/app-preferences/components/SettingsAppPreferencesListEmptyStateCard';
import { SETTINGS_ACCOUNT_GROUP_TABLE_GRID_TEMPLATE_COLUMNS } from '@/settings/app-preferences/constants/SettingsAccountGroupTableGridTemplateColumns';
import { SETTINGS_NATIVE_ACCOUNT_APP_ACCOUNT_GROUP_TABLE_GRID_TEMPLATE_COLUMNS } from '@/settings/app-preferences/constants/SettingsNativeAccountAppAccountGroupTableGridTemplateColumns';
import { useMyAccountGroups } from '@/settings/app-preferences/hooks/useMyAccountGroups';
import { type NativeAccountApp } from '@/settings/app-preferences/types/NativeAccountApp';
import { getNativeAccountAppsUsingAccount } from '@/settings/app-preferences/utils/getNativeAccountAppsUsingAccount';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
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
  nativeAccountApp?: NativeAccountApp;
};

export const SettingsAccountGroupsSection = ({
  nativeAccountApp,
}: SettingsAccountGroupsSectionProps) => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const { groups: allGroups, loading } = useMyAccountGroups();

  const groups = isDefined(nativeAccountApp)
    ? allGroups.filter((group) =>
        getNativeAccountAppsUsingAccount(group.nativeAccount).some(
          (app) => app.id === nativeAccountApp.id,
        ),
      )
    : allGroups;

  const gridTemplateColumns = isDefined(nativeAccountApp)
    ? SETTINGS_NATIVE_ACCOUNT_APP_ACCOUNT_GROUP_TABLE_GRID_TEMPLATE_COLUMNS
    : SETTINGS_ACCOUNT_GROUP_TABLE_GRID_TEMPLATE_COLUMNS;

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
        <SettingsAppPreferencesListEmptyStateCard
          provider={nativeAccountApp?.provider}
        />
      ) : (
        <>
          <Table>
            <TableRow gridTemplateColumns={gridTemplateColumns}>
              <TableHeader>{t`Account`}</TableHeader>
              {isDefined(nativeAccountApp) ? (
                <TableHeader>{t`Permissions`}</TableHeader>
              ) : (
                <TableHeader align="right">{t`Used by`}</TableHeader>
              )}
              <TableHeader />
            </TableRow>
            <StyledTableRows>
              {groups.map((group) => (
                <SettingsAccountGroupTableRow
                  key={group.id}
                  group={group}
                  gridTemplateColumns={gridTemplateColumns}
                  nativeAccountApp={nativeAccountApp}
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
