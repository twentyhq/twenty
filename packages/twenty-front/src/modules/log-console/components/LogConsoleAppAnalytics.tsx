import { skipToken, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { useRefetchOnApplicationRegistrationChange } from '@/applications/hooks/useRefetchOnApplicationRegistrationChange';
import { applicationsSelector } from '@/applications/states/applicationsSelector';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { LogConsoleAppAnalyticsRangeDropdown } from '@/log-console/components/LogConsoleAppAnalyticsRangeDropdown';
import { LogConsoleAppAnalyticsReport } from '@/log-console/components/LogConsoleAppAnalyticsReport';
import { LOG_CONSOLE_APP_ANALYTICS_SCOPES } from '@/log-console/constants/LogConsoleAppAnalyticsScopes';
import { logConsoleAppAnalyticsApplicationIdState } from '@/log-console/states/logConsoleAppAnalyticsApplicationIdState';
import { logConsoleAppAnalyticsRangeState } from '@/log-console/states/logConsoleAppAnalyticsRangeState';
import { logConsoleAppAnalyticsRegistrationIdState } from '@/log-console/states/logConsoleAppAnalyticsRegistrationIdState';
import { logConsoleAppAnalyticsScopeState } from '@/log-console/states/logConsoleAppAnalyticsScopeState';
import { type LogConsoleAppAnalyticsScope } from '@/log-console/types/LogConsoleAppAnalyticsScope';
import { type LogConsoleAppAnalyticsTarget } from '@/log-console/types/LogConsoleAppAnalyticsTarget';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { Select } from '@/ui/input/components/Select';
import { APP_HEADER_HEIGHT } from '@/ui/layout/constants/AppHeaderHeight';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  FindManyApplicationRegistrationsDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

const LOG_CONSOLE_APP_ANALYTICS_SCROLL_WRAPPER_ID = 'log-console-app-analytics';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const StyledToolbar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  height: ${APP_HEADER_HEIGHT}px;
  justify-content: space-between;
  padding-inline: ${themeCssVariables.spacing[3]};
`;

const StyledToolbarGroup = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledContent = styled.div`
  box-sizing: border-box;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]};
`;

type LogConsoleAppAnalyticsAppOption = {
  id: string;
  name: string;
  trackedSince?: string;
};

export const LogConsoleAppAnalytics = () => {
  const { t } = useLingui();
  const permissionFlagMap = useAtomStateValue(permissionFlagMapSelector);
  const canReadInstalledApps =
    permissionFlagMap[PermissionFlagType.APPLICATIONS];
  const canReadOwnedRegistrations =
    permissionFlagMap[PermissionFlagType.API_KEYS_AND_WEBHOOKS];

  const [logConsoleAppAnalyticsScope, setLogConsoleAppAnalyticsScope] =
    useAtomState(logConsoleAppAnalyticsScopeState);
  const [
    logConsoleAppAnalyticsApplicationId,
    setLogConsoleAppAnalyticsApplicationId,
  ] = useAtomState(logConsoleAppAnalyticsApplicationIdState);
  const [
    logConsoleAppAnalyticsRegistrationId,
    setLogConsoleAppAnalyticsRegistrationId,
  ] = useAtomState(logConsoleAppAnalyticsRegistrationIdState);
  const [logConsoleAppAnalyticsRange, setLogConsoleAppAnalyticsRange] =
    useAtomState(logConsoleAppAnalyticsRangeState);

  const applications = useAtomStateValue(applicationsSelector);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const { data, loading, refetch } = useQuery(
    FindManyApplicationRegistrationsDocument,
    canReadOwnedRegistrations ? {} : skipToken,
  );

  useRefetchOnApplicationRegistrationChange({
    refetch: () => {
      if (canReadOwnedRegistrations) {
        refetch();
      }
    },
  });

  if (canReadOwnedRegistrations && loading && !isDefined(data)) {
    return null;
  }

  const installedAtByApplicationId = new Map(
    (currentWorkspace?.installedApplications ?? []).map(
      (installedApplication) => [
        installedApplication.id,
        installedApplication.createdAt,
      ],
    ),
  );

  // Metrics are keyed by registration, so an app installed without one has nothing to report
  const installedApplicationOptions: LogConsoleAppAnalyticsAppOption[] =
    canReadInstalledApps
      ? applications
          .filter((application) =>
            isDefined(application.applicationRegistrationId),
          )
          .map((application) => ({
            id: application.id,
            name: application.name,
            trackedSince: installedAtByApplicationId.get(application.id),
          }))
      : [];

  const ownedRegistrationOptions: LogConsoleAppAnalyticsAppOption[] = (
    data?.findManyApplicationRegistrations ?? []
  ).map((registration) => ({
    id: registration.id,
    name: registration.name,
    trackedSince: registration.createdAt,
  }));

  const appOptionsByScope: Record<
    LogConsoleAppAnalyticsScope,
    LogConsoleAppAnalyticsAppOption[]
  > = {
    'current-workspace': installedApplicationOptions,
    'all-workspaces': ownedRegistrationOptions,
  };

  const availableScopes = LOG_CONSOLE_APP_ANALYTICS_SCOPES.filter(
    (availableScope) => appOptionsByScope[availableScope].length > 0,
  );

  const scope = availableScopes.includes(logConsoleAppAnalyticsScope)
    ? logConsoleAppAnalyticsScope
    : availableScopes[0];

  if (!isDefined(scope)) {
    return (
      <SettingsEmptyPlaceholder>
        {t`No app to report on yet. Analytics appear here for the apps installed in this workspace and the apps it develops.`}
      </SettingsEmptyPlaceholder>
    );
  }

  const appOptions = appOptionsByScope[scope];

  const selectedAppId =
    scope === 'current-workspace'
      ? logConsoleAppAnalyticsApplicationId
      : logConsoleAppAnalyticsRegistrationId;

  const selectedApp =
    appOptions.find((appOption) => appOption.id === selectedAppId) ??
    appOptions[0];

  const setSelectedAppId =
    scope === 'current-workspace'
      ? setLogConsoleAppAnalyticsApplicationId
      : setLogConsoleAppAnalyticsRegistrationId;

  const target: LogConsoleAppAnalyticsTarget =
    scope === 'current-workspace'
      ? { scope, applicationId: selectedApp.id }
      : { scope, applicationRegistrationId: selectedApp.id };

  const scopeLabels: Record<LogConsoleAppAnalyticsScope, string> = {
    'current-workspace': t`This workspace`,
    'all-workspaces': t`All workspaces`,
  };

  return (
    <StyledContainer>
      <StyledToolbar>
        <StyledToolbarGroup>
          {availableScopes.length > 1 && (
            <Select
              dropdownId="log-console-app-analytics-scope"
              aria-label={t`Scope`}
              value={scope}
              options={availableScopes.map((availableScope) => ({
                value: availableScope,
                label: scopeLabels[availableScope],
              }))}
              onChange={setLogConsoleAppAnalyticsScope}
              selectSizeVariant="small"
              needIconCheck
            />
          )}
          <Select
            dropdownId="log-console-app-analytics-app"
            aria-label={t`App`}
            value={selectedApp.id}
            options={appOptions.map((appOption) => ({
              value: appOption.id,
              label: appOption.name,
            }))}
            onChange={setSelectedAppId}
            dropdownWidth={GenericDropdownContentWidth.Large}
            selectSizeVariant="small"
            withSearchInput={appOptions.length > 5}
            needIconCheck
          />
        </StyledToolbarGroup>
        <LogConsoleAppAnalyticsRangeDropdown
          range={logConsoleAppAnalyticsRange}
          onRangeChange={setLogConsoleAppAnalyticsRange}
        />
      </StyledToolbar>
      <ScrollWrapper
        componentInstanceId={LOG_CONSOLE_APP_ANALYTICS_SCROLL_WRAPPER_ID}
      >
        <StyledContent>
          <LogConsoleAppAnalyticsReport
            key={`${scope}-${selectedApp.id}`}
            target={target}
            trackedSince={selectedApp.trackedSince}
            range={logConsoleAppAnalyticsRange}
          />
        </StyledContent>
      </ScrollWrapper>
    </StyledContainer>
  );
};
