import { H2Title, IconChevronRight } from 'twenty-ui/display';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { useLingui } from '@lingui/react/macro';
import { Table } from '@/ui/layout/table/components/Table';
import { styled } from '@linaria/react';
import {
  APPLICATION_TABLE_ROW_GRID_TEMPLATE_COLUMNS,
  SettingsApplicationTableRow,
} from '~/pages/settings/applications/components/SettingsApplicationTableRow';
import { useContext, useState } from 'react';
import { type ApplicationWithoutRelation } from '~/pages/settings/applications/types/applicationWithoutRelation';
import { isNewerSemver } from '~/pages/settings/applications/utils/isNewerSemver';
import { Section } from 'twenty-ui/layout';
import { SearchInput } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';

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
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredApplications = applications
    .filter(
      (application) =>
        application.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (application.description ?? '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
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
    <Section>
      <H2Title
        title={t`Installed apps`}
        description={t`All the applications currently installed on this workspace`}
      />
      <StyledSearchInputContainer>
        <SearchInput
          placeholder={t`Search an application`}
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </StyledSearchInputContainer>
      <Table>
        <TableRow
          gridTemplateColumns={APPLICATION_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
        >
          <TableHeader> {t`Name`}</TableHeader>
          <TableHeader> {t`Type`}</TableHeader>
          <TableHeader> {t`Description`}</TableHeader>
          <TableHeader> {''}</TableHeader>
          <TableHeader />
        </TableRow>
        <StyledTableRowsContainer>
          {filteredApplications.map((application) => {
            const isNpmApp =
              application.applicationRegistration?.sourceType ===
              ApplicationRegistrationSourceType.NPM;

            const latestVersion =
              application.applicationRegistration?.latestAvailableVersion;

            const hasUpdate =
              isNpmApp &&
              isDefined(latestVersion) &&
              isDefined(application.version) &&
              isNewerSemver(latestVersion, application.version);

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
    </Section>
  );
};
