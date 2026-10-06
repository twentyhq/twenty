import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import {
  SETTINGS_APP_PREFERENCES_APPLICATIONS_GRID_TEMPLATE_COLUMNS,
  SettingsAppPreferencesApplicationRow,
} from '@/settings/app-preferences/components/SettingsAppPreferencesApplicationRow';
import { SettingsAppPreferencesInstalledApplicationRow } from '@/settings/app-preferences/components/SettingsAppPreferencesInstalledApplicationRow';
import { usePreinstalledApplications } from '@/settings/app-preferences/hooks/usePreinstalledApplications';
import { type AppPreferencesApplication } from '@/settings/app-preferences/types/AppPreferencesApplication';
import { getAppPreferencesApplications } from '@/settings/app-preferences/utils/getAppPreferencesApplications';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledTableRowsContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: ${themeCssVariables.spacing[2]} 0;
`;

type SettingsAppPreferencesApplicationsSectionProps = {
  applications: AppPreferencesApplication[];
  accounts: ConnectedAccount[];
};

export const SettingsAppPreferencesApplicationsSection = ({
  applications,
  accounts,
}: SettingsAppPreferencesApplicationsSectionProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const preinstalledApplications = usePreinstalledApplications();
  const installedApplications = getAppPreferencesApplications(
    applications,
    accounts,
  );

  const hasRows =
    preinstalledApplications.length > 0 || installedApplications.length > 0;

  return (
    <Section.Root>
      <Section.Header
        title={t`Apps preferences`}
        description={t`Choose your preferences for the apps installed on your workspace by the admin`}
      />
      {hasRows && (
        <Table>
          <TableRow
            gridTemplateColumns={
              SETTINGS_APP_PREFERENCES_APPLICATIONS_GRID_TEMPLATE_COLUMNS
            }
          >
            <TableHeader>{t`App`}</TableHeader>
            <TableHeader align="right">{t`Type`}</TableHeader>
            <TableHeader />
          </TableRow>
          <StyledTableRowsContainer>
            {preinstalledApplications.map(
              ({ id, name, typeLabel, Icon, settingsPath }) => (
                <SettingsAppPreferencesApplicationRow
                  key={id}
                  name={name}
                  icon={<Icon size={theme.icon.size.md} />}
                  type={typeLabel}
                  to={getSettingsPath(settingsPath)}
                />
              ),
            )}
            {installedApplications.map((application) => (
              <SettingsAppPreferencesInstalledApplicationRow
                key={application.id}
                application={application}
                hasConnectedAccount={accounts.some(
                  (account) => account.applicationId === application.id,
                )}
              />
            ))}
          </StyledTableRowsContainer>
        </Table>
      )}
    </Section.Root>
  );
};
