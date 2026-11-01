import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';

import { isClickHouseConfiguredState } from '@/client-config/states/isClickHouseConfiguredState';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminApplicationMonitoringWorkspaceSelect } from '@/settings/admin-panel/apps/components/SettingsAdminApplicationMonitoringWorkspaceSelect';
import { SettingsAdminApplicationMonitoringWorkspacesTable } from '@/settings/admin-panel/apps/components/SettingsAdminApplicationMonitoringWorkspacesTable';
import { APPLICATION_REGISTRATION_ADMIN_PATH } from '@/settings/admin-panel/apps/constants/ApplicationRegistrationAdminPath';
import { type AdminApplicationMonitoringWorkspace } from '@/settings/admin-panel/apps/types/AdminApplicationMonitoringWorkspace';
import { ApplicationMonitoring } from '@/settings/application-monitoring/components/ApplicationMonitoring';
import { ApplicationMonitoringFallback } from '@/settings/application-monitoring/components/ApplicationMonitoringFallback';
import { buildApplicationMonitoringPeriodRange } from '@/settings/application-monitoring/utils/buildApplicationMonitoringPeriodRange';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSkeletonLoader } from '@/settings/components/SettingsSkeletonLoader';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  FindAdminApplicationRegistrationInstalledWorkspacesDocument,
  FindAdminApplicationRegistrationMonitoringDocument,
  FindOneAdminApplicationRegistrationDocument,
} from '~/generated-admin/graphql';

const WORKSPACE_FILTER_LIMIT = 100;

export const SettingsAdminApplicationRegistrationMonitoring = () => {
  const { t } = useLingui();
  const apolloAdminClient = useApolloAdminClient();
  const isClickHouseConfigured = useAtomStateValue(isClickHouseConfiguredState);

  const { applicationRegistrationId = '' } = useParams<{
    applicationRegistrationId: string;
  }>();

  const [periodRange, setPeriodRange] = useState(() =>
    buildApplicationMonitoringPeriodRange({ period: '7d' }),
  );
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<AdminApplicationMonitoringWorkspace>();
  const [refreshedQueryKey, setRefreshedQueryKey] = useState<string | null>(
    null,
  );

  const { data: registrationData, loading: isRegistrationLoading } = useQuery(
    FindOneAdminApplicationRegistrationDocument,
    {
      client: apolloAdminClient,
      variables: { id: applicationRegistrationId },
      skip: !isNonEmptyString(applicationRegistrationId),
    },
  );

  const { data: installedWorkspacesData } = useQuery(
    FindAdminApplicationRegistrationInstalledWorkspacesDocument,
    {
      client: apolloAdminClient,
      variables: {
        input: { id: applicationRegistrationId, limit: WORKSPACE_FILTER_LIMIT },
      },
      skip: !isNonEmptyString(applicationRegistrationId),
    },
  );

  const { data, previousData, loading, error } = useQuery(
    FindAdminApplicationRegistrationMonitoringDocument,
    {
      client: apolloAdminClient,
      variables: {
        id: applicationRegistrationId,
        workspaceId: selectedWorkspace?.workspaceId,
        periodStart: periodRange.periodStart,
        periodEnd: periodRange.periodEnd,
      },
      skip:
        !isClickHouseConfigured || !isNonEmptyString(applicationRegistrationId),
    },
  );

  const registration = registrationData?.findOneAdminApplicationRegistration;
  const queryKey = `${applicationRegistrationId}:${selectedWorkspace?.workspaceId ?? ''}`;
  const monitoring = (
    data ?? (refreshedQueryKey === queryKey ? previousData : undefined)
  )?.findAdminApplicationRegistrationMonitoring;
  const installedWorkspaces = (
    installedWorkspacesData?.findAdminApplicationRegistrationInstalledWorkspaces
      .workspaces ?? []
  ).map(({ id, displayName }) => ({
    workspaceId: id,
    workspaceName: displayName ?? null,
  }));

  const adminAppsLinks = [
    {
      children: t`Other`,
      href: getSettingsPath(SettingsPath.AdminPanel),
    },
    {
      children: t`Admin Panel - Apps`,
      href: APPLICATION_REGISTRATION_ADMIN_PATH,
    },
  ];

  if (!isDefined(registration)) {
    if (isRegistrationLoading) {
      return <SettingsSkeletonLoader />;
    }

    return (
      <SettingsPageLayout
        title={t`Monitoring`}
        links={[...adminAppsLinks, { children: t`Monitoring` }]}
      >
        <SettingsPageContainer>
          <SettingsEmptyPlaceholder>{t`This app could not be found`}</SettingsEmptyPlaceholder>
        </SettingsPageContainer>
      </SettingsPageLayout>
    );
  }

  const instanceId = `admin-application-registration-monitoring-${registration.id}`;
  const workspaceSelect = (
    <SettingsAdminApplicationMonitoringWorkspaceSelect
      dropdownId={`${instanceId}-workspace`}
      workspaces={installedWorkspaces}
      selectedWorkspace={selectedWorkspace}
      onChange={setSelectedWorkspace}
    />
  );

  const renderContent = () => {
    if (!isClickHouseConfigured || isDefined(error) || !isDefined(monitoring)) {
      return (
        <ApplicationMonitoringFallback
          isClickHouseConfigured={isClickHouseConfigured}
          hasError={isDefined(error)}
          actions={workspaceSelect}
        />
      );
    }

    const activeWorkspaceCountLabel =
      monitoring.activeWorkspaceCount.toString();

    return (
      <>
        <ApplicationMonitoring
          instanceId={instanceId}
          monitoring={monitoring}
          selectedPeriod={periodRange.period}
          onPeriodChange={(period) => {
            setRefreshedQueryKey(null);
            setPeriodRange(buildApplicationMonitoringPeriodRange({ period }));
          }}
          onRefresh={() => {
            setRefreshedQueryKey(queryKey);
            setPeriodRange(
              buildApplicationMonitoringPeriodRange({
                period: periodRange.period,
              }),
            );
          }}
          isRefreshing={loading}
          isAdminView
          additionalActions={workspaceSelect}
        />
        <Section.Root>
          <Section.Header
            title={t`Workspaces`}
            description={t`Most active first, out of ${activeWorkspaceCountLabel} active in this period`}
          />
          <SettingsAdminApplicationMonitoringWorkspacesTable
            workspaces={monitoring.workspaces}
          />
        </Section.Root>
      </>
    );
  };

  return (
    <SettingsPageLayout
      title={t`Monitoring`}
      links={[
        ...adminAppsLinks,
        {
          children: registration.name,
          href: getSettingsPath(
            SettingsPath.AdminPanelApplicationRegistrationDetail,
            { applicationRegistrationId: registration.id },
          ),
        },
        { children: t`Monitoring` },
      ]}
    >
      <SettingsPageContainer>{renderContent()}</SettingsPageContainer>
    </SettingsPageLayout>
  );
};
