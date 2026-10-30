import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { SettingsApplicationTableHeaderRow } from '@/settings/applications/components/SettingsApplicationTableHeaderRow';
import { SettingsApplicationsTableApplicationRow } from '@/settings/applications/components/SettingsApplicationsTableApplicationRow';
import { SettingsApplicationsTableBuiltInAccountAppRow } from '@/settings/applications/components/SettingsApplicationsTableBuiltInAccountAppRow';
import { type SettingsApplicationsTableApplication } from '@/settings/applications/types/SettingsApplicationsTableApplication';
import { type SettingsApplicationsTableLinkTarget } from '@/settings/applications/types/SettingsApplicationsTableLinkTarget';
import { type SettingsApplicationTableRowMiddleColumn } from '@/settings/applications/types/SettingsApplicationTableRowMiddleColumn';
import { type SettingsMemberApplicationStatus } from '@/settings/applications/types/SettingsMemberApplicationStatus';
import { type SettingsWorkspaceApplicationStatus } from '@/settings/applications/types/SettingsWorkspaceApplicationStatus';
import { sortApplicationsWithOAuthOnlyLast } from '@/settings/applications/utils/sortApplicationsWithOAuthOnlyLast';
import { splitApplicationsAroundBuiltInAccountApps } from '@/settings/applications/utils/splitApplicationsAroundBuiltInAccountApps';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { Table } from '@/ui/layout/table/components/Table';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { SearchInput } from 'twenty-ui/components/input';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

const StyledTableRowsContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledSearchInputContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

type SettingsApplicationsTableProps = {
  title: string;
  description: string;
  applications: SettingsApplicationsTableApplication[];
  builtInAccountApps: BuiltInAccountApp[];
  middleColumn: SettingsApplicationTableRowMiddleColumn;
  isLoading?: boolean;
  toolbar?: ReactNode;
} & (
  | {
      linkTarget: Extract<
        SettingsApplicationsTableLinkTarget,
        'applicationDetail'
      >;
      statusesById?: Record<string, SettingsWorkspaceApplicationStatus[]>;
    }
  | {
      linkTarget: Extract<
        SettingsApplicationsTableLinkTarget,
        'applicationPreferences'
      >;
      statusesById?: Record<string, SettingsMemberApplicationStatus[]>;
    }
);

export const SettingsApplicationsTable = ({
  title,
  description,
  applications,
  builtInAccountApps,
  linkTarget,
  middleColumn,
  statusesById,
  isLoading = false,
  toolbar,
}: SettingsApplicationsTableProps) => {
  const { t } = useLingui();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredApplications = sortApplicationsWithOAuthOnlyLast(
    filterBySearchQuery({
      items: applications,
      searchQuery: searchTerm.trim(),
      getSearchableValues: (application) => [
        application.name,
        application.description ?? '',
      ],
    }),
  );

  const filteredBuiltInAccountApps = filterBySearchQuery({
    items: builtInAccountApps,
    searchQuery: searchTerm.trim(),
    getSearchableValues: (builtInAccountApp) => [
      t(builtInAccountApp.name),
      t(builtInAccountApp.description),
    ],
  });

  const {
    applicationsBeforeBuiltInAccountApps,
    applicationsAfterBuiltInAccountApps,
  } = splitApplicationsAroundBuiltInAccountApps({
    applications: filteredApplications,
    hasBuiltInAccountApps: isNonEmptyArray(builtInAccountApps),
  });

  const hasApplications =
    isNonEmptyArray(applications) || isNonEmptyArray(builtInAccountApps);

  return (
    <Section.Root>
      <Section.Header title={title} description={description} />
      {toolbar}
      {isLoading && <SettingsSectionSkeletonLoader />}
      {!isLoading && hasApplications && (
        <>
          <StyledSearchInputContainer>
            <SearchInput
              placeholder={t`Search an application`}
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
          </StyledSearchInputContainer>
          <Table>
            <SettingsApplicationTableHeaderRow middleColumn={middleColumn} />
            <StyledTableRowsContainer>
              {filteredApplications.length === 0 &&
                filteredBuiltInAccountApps.length === 0 && (
                  <SettingsEmptyPlaceholder padding="4">
                    <span role="status">{t`No application matches your search`}</span>
                  </SettingsEmptyPlaceholder>
                )}
              {applicationsBeforeBuiltInAccountApps.map((application) => (
                <SettingsApplicationsTableApplicationRow
                  key={application.id}
                  application={application}
                  linkTarget={linkTarget}
                  middleColumn={middleColumn}
                  statuses={statusesById?.[application.id]}
                />
              ))}
              {filteredBuiltInAccountApps.map((builtInAccountApp) => (
                <SettingsApplicationsTableBuiltInAccountAppRow
                  key={builtInAccountApp.id}
                  builtInAccountApp={builtInAccountApp}
                  linkTarget={linkTarget}
                  middleColumn={middleColumn}
                  statuses={statusesById?.[builtInAccountApp.id]}
                />
              ))}
              {applicationsAfterBuiltInAccountApps.map((application) => (
                <SettingsApplicationsTableApplicationRow
                  key={application.id}
                  application={application}
                  linkTarget={linkTarget}
                  middleColumn={middleColumn}
                  statuses={statusesById?.[application.id]}
                />
              ))}
            </StyledTableRowsContainer>
          </Table>
        </>
      )}
    </Section.Root>
  );
};
