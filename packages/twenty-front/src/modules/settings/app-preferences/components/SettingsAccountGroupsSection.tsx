import { SettingsAccountGroupTableRow } from '@/settings/app-preferences/components/SettingsAccountGroupTableRow';
import { SettingsAccountGroupsEmptyState } from '@/settings/app-preferences/components/SettingsAccountGroupsEmptyState';
import { useAddBuiltInAccount } from '@/settings/app-preferences/hooks/useAddBuiltInAccount';
import { useMyAccountGroups } from '@/settings/app-preferences/hooks/useMyAccountGroups';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { getBuiltInAccountAppsUsingAccount } from '@/settings/app-preferences/utils/getBuiltInAccountAppsUsingAccount';
import { SettingsApplicationTableHeaderRow } from '@/settings/applications/components/SettingsApplicationTableHeaderRow';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { Table } from '@/ui/layout/table/components/Table';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

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
  const { addBuiltInAccount } = useAddBuiltInAccount();
  const { groups: allGroups, loading } = useMyAccountGroups();

  const groups = isDefined(builtInAccountApp)
    ? allGroups.filter((group) =>
        getBuiltInAccountAppsUsingAccount(group.builtInAccount).some(
          (app) => app.id === builtInAccountApp.id,
        ),
      )
    : allGroups;

  return (
    <Section.Root>
      <Section.Header
        title={t`Accounts`}
        description={t`Shared accounts between apps`}
      />
      {loading ? (
        <SettingsSectionSkeletonLoader />
      ) : groups.length === 0 ? (
        <SettingsAccountGroupsEmptyState
          builtInAccountApp={builtInAccountApp}
        />
      ) : (
        <>
          <Table>
            <SettingsApplicationTableHeaderRow
              middleColumn="status"
              nameLabel={t`Account`}
              detailsLabel={
                isDefined(builtInAccountApp) ? t`Permissions` : t`Used by`
              }
              detailsAlign={isDefined(builtInAccountApp) ? 'left' : 'right'}
            />
            <StyledTableRows>
              {groups.map((group) => (
                <SettingsAccountGroupTableRow
                  key={group.id}
                  group={group}
                  builtInAccountApp={builtInAccountApp}
                />
              ))}
            </StyledTableRows>
          </Table>
          {isDefined(builtInAccountApp) && (
            <StyledAddAccountContainer>
              <Button
                startIcon={<IconPlus />}
                size="sm"
                onClick={() => addBuiltInAccount(builtInAccountApp)}
                variant="outline"
              >{t`Add account`}</Button>
            </StyledAddAccountContainer>
          )}
        </>
      )}
    </Section.Root>
  );
};
