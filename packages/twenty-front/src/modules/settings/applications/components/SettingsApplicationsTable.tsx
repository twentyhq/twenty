import { type AppPreferencesAppStatus } from '@/settings/app-preferences/types/AppPreferencesAppStatus';
import { type BuiltInAccountApp } from '@/settings/app-preferences/types/BuiltInAccountApp';
import { getBuiltInAccountAppLogoUrl } from '@/settings/app-preferences/utils/getBuiltInAccountAppLogoUrl';
import { splitApplicationsAroundBuiltInAccountApps } from '@/settings/applications/utils/splitApplicationsAroundBuiltInAccountApps';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { Table } from '@/ui/layout/table/components/Table';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isNonEmptyArray } from 'twenty-shared/utils';
import { SearchInput } from 'twenty-ui/components/input';
import { Section } from 'twenty-ui/components/layout';
import { IconChevronRight } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';
import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';
import { SettingsApplicationTableHeaderRow } from '@/settings/applications/components/SettingsApplicationTableHeaderRow';
import { SettingsApplicationTableRow } from '@/settings/applications/components/SettingsApplicationTableRow';
import { type SettingsApplicationTableRowMiddleColumn } from '@/settings/applications/types/SettingsApplicationTableRowMiddleColumn';
import { type ApplicationWithoutRelation } from '@/applications/types/ApplicationWithoutRelation';
import { hasApplicationUpdate } from '@/settings/applications/utils/hasApplicationUpdate';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

const StyledTableRowsContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledSearchInputContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

type SettingsApplicationsTableApplication = Pick<
  ApplicationWithoutRelation,
  | 'id'
  | 'name'
  | 'description'
  | 'logoUrl'
  | 'universalIdentifier'
  | 'version'
  | 'applicationRegistration'
>;

type SettingsApplicationsTableProps = {
  title: string;
  description: string;
  applications: SettingsApplicationsTableApplication[];
  builtInAccountApps: BuiltInAccountApp[];
  variant: 'workspace' | 'member';
  statusById?: Record<string, AppPreferencesAppStatus>;
  isLoading?: boolean;
  toolbar?: ReactNode;
};

export const SettingsApplicationsTable = ({
  title,
  description,
  applications,
  builtInAccountApps,
  variant,
  statusById,
  isLoading = false,
  toolbar,
}: SettingsApplicationsTableProps) => {
  const theme = useTheme();
  const { t } = useLingui();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredApplications = filterBySearchQuery({
    items: applications,
    searchQuery: searchTerm.trim(),
    getSearchableValues: (application) => [
      application.name,
      application.description ?? '',
    ],
  }).sort((firstApplication, secondApplication) => {
    const isFirstApplicationOAuthOnly =
      firstApplication.applicationRegistration?.sourceType ===
      ApplicationRegistrationSourceType.OAUTH_ONLY;
    const isSecondApplicationOAuthOnly =
      secondApplication.applicationRegistration?.sourceType ===
      ApplicationRegistrationSourceType.OAUTH_ONLY;

    if (isFirstApplicationOAuthOnly === isSecondApplicationOAuthOnly) {
      return 0;
    }

    return isFirstApplicationOAuthOnly ? 1 : -1;
  });

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

  const chevronIcon = (
    <IconChevronRight
      size={theme.icon.size.md}
      stroke={theme.icon.stroke.sm}
      color={theme.font.color.light}
    />
  );

  const hasApplications =
    isNonEmptyArray(applications) || isNonEmptyArray(builtInAccountApps);

  const middleColumn: SettingsApplicationTableRowMiddleColumn =
    variant === 'member' ? 'status' : 'type';

  const getApplicationLink = (applicationId: string) =>
    variant === 'member'
      ? getSettingsPath(SettingsPath.ApplicationPreferences, { applicationId })
      : getSettingsPath(SettingsPath.ApplicationDetail, { applicationId });

  const getBuiltInAccountAppLink = (
    builtInAccountAppId: BuiltInAccountApp['id'],
  ) =>
    variant === 'member'
      ? getSettingsPath(SettingsPath.BuiltInAccountApp, { builtInAccountAppId })
      : getSettingsPath(SettingsPath.ApplicationDetail, {
          applicationId: builtInAccountAppId,
        });

  const renderApplicationRow = (
    application: SettingsApplicationsTableApplication,
  ) => {
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
        middleColumn={middleColumn}
        status={statusById?.[application.id]}
        action={chevronIcon}
        link={getApplicationLink(application.id)}
      />
    );
  };

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
              {applicationsBeforeBuiltInAccountApps.map(renderApplicationRow)}
              {filteredBuiltInAccountApps.map((builtInAccountApp) => (
                <SettingsApplicationTableRow
                  key={builtInAccountApp.id}
                  application={{
                    name: t(builtInAccountApp.name),
                    description: t(builtInAccountApp.description),
                    logoUrl: getBuiltInAccountAppLogoUrl(builtInAccountApp),
                  }}
                  middleColumn={middleColumn}
                  status={statusById?.[builtInAccountApp.id]}
                  action={chevronIcon}
                  link={getBuiltInAccountAppLink(builtInAccountApp.id)}
                />
              ))}
              {applicationsAfterBuiltInAccountApps.map(renderApplicationRow)}
            </StyledTableRowsContainer>
          </Table>
        </>
      )}
    </Section.Root>
  );
};
