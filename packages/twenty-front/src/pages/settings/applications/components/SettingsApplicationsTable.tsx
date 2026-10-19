import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { SearchInput } from 'twenty-ui/components/input';
import { Section } from 'twenty-ui/components/layout';
import { IconChevronRight } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';
import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';
import {
  APPLICATION_TABLE_ROW_GRID_TEMPLATE_COLUMNS,
  SettingsApplicationTableRow,
} from '~/pages/settings/applications/components/SettingsApplicationTableRow';
import { type ApplicationWithoutRelation } from '@/applications/types/ApplicationWithoutRelation';
import { hasApplicationUpdate } from '~/pages/settings/applications/utils/hasApplicationUpdate';

const StyledTableRowsContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledSearchInputContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

export const SettingsApplicationsTable = ({
  applications,
}: {
  applications: ApplicationWithoutRelation[];
}) => {
  const theme = useTheme();
  const { t } = useLingui();

  const [searchTerm, setSearchTerm] = useState('');

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredApplications = applications
    .filter(
      (application) =>
        application.name.toLowerCase().includes(normalizedSearchTerm) ||
        (application.description ?? '')
          .toLowerCase()
          .includes(normalizedSearchTerm),
    )
    .sort((a, b) => {
      const aIsOAuth =
        a.applicationRegistration?.sourceType ===
        ApplicationRegistrationSourceType.OAUTH_ONLY;
      const bIsOAuth =
        b.applicationRegistration?.sourceType ===
        ApplicationRegistrationSourceType.OAUTH_ONLY;

      if (aIsOAuth === bIsOAuth) return 0;

      return aIsOAuth ? 1 : -1;
    });

  return (
    <Section.Root>
      <Section.Header
        title={t`Installed apps`}
        description={t`All the applications currently installed on this workspace`}
      />
      <StyledSearchInputContainer>
        <SearchInput
          placeholder={t`Search an application`}
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
      </StyledSearchInputContainer>
      <Table>
        <TableRow
          gridTemplateColumns={APPLICATION_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
        >
          <TableHeader>{t`Name`}</TableHeader>
          <TableHeader>{t`Type`}</TableHeader>
          <TableHeader>{t`Description`}</TableHeader>
          <TableHeader />
        </TableRow>
        <StyledTableRowsContainer>
          {filteredApplications.length === 0 && (
            <SettingsEmptyPlaceholder padding="4">
              <span role="status">{t`No application matches your search`}</span>
            </SettingsEmptyPlaceholder>
          )}
          {filteredApplications.map((application) => {
            const hasUpdate = hasApplicationUpdate({
              sourceType: application.applicationRegistration?.sourceType,
              currentVersion: application.version,
              latestAvailableVersion:
                application.applicationRegistration?.latestAvailableVersion,
            });

            return (
              <SettingsApplicationTableRow
                key={application.id}
                application={application}
                hasUpdate={hasUpdate}
                sourceType={application.applicationRegistration?.sourceType}
                action={
                  <IconChevronRight
                    size={theme.icon.size.md}
                    stroke={theme.icon.stroke.sm}
                    color={theme.font.color.light}
                  />
                }
                link={getSettingsPath(SettingsPath.ApplicationDetail, {
                  applicationId: application.id,
                })}
              />
            );
          })}
        </StyledTableRowsContainer>
      </Table>
    </Section.Root>
  );
};
