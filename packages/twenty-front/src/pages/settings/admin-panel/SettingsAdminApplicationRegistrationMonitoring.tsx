import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
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
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FindAdminApplicationRegistrationMonitoringDocument,
  FindOneAdminApplicationRegistrationDocument,
} from '~/generated-admin/graphql';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const SettingsAdminApplicationRegistrationMonitoring = () => {
  const { t } = useLingui();
  const apolloAdminClient = useApolloAdminClient();
  const isApplicationMonitoringEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APPLICATION_MONITORING_ENABLED,
  );
  const isClickHouseConfigured = useAtomStateValue(isClickHouseConfiguredState);

  const { applicationRegistrationId = '' } = useParams<{
    applicationRegistrationId: string;
  }>();

  const [periodRange, setPeriodRange] = useState(() =>
    buildApplicationMonitoringPeriodRange('7d'),
  );
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<AdminApplicationMonitoringWorkspace>();

  const { data: registrationData } = useQuery(
    FindOneAdminApplicationRegistrationDocument,
    {
      client: apolloAdminClient,
      variables: { id: applicationRegistrationId },
      skip: !isApplicationMonitoringEnabled || !applicationRegistrationId,
    },
  );

  const { data, error } = useQuery(
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
        !isApplicationMonitoringEnabled ||
        !isClickHouseConfigured ||
        !applicationRegistrationId,
    },
  );

  const registration = registrationData?.findOneAdminApplicationRegistration;
  const monitoring = data?.findAdminApplicationRegistrationMonitoring;

  if (!isApplicationMonitoringEnabled || !isDefined(registration)) {
    return null;
  }

  const renderContent = () => {
    if (!isClickHouseConfigured || isDefined(error) || !isDefined(monitoring)) {
      return (
        <ApplicationMonitoringFallback
          isClickHouseConfigured={isClickHouseConfigured}
          hasError={isDefined(error)}
        />
      );
    }

    const instanceId = `admin-application-registration-monitoring-${registration.id}`;
    const activeWorkspaceCountLabel =
      monitoring.activeWorkspaceCount.toString();

    return (
      <>
        <ApplicationMonitoring
          instanceId={instanceId}
          monitoring={monitoring}
          selectedPeriod={periodRange.period}
          onPeriodChange={(period) =>
            setPeriodRange(buildApplicationMonitoringPeriodRange(period))
          }
          isAdminView
          additionalActions={
            <SettingsAdminApplicationMonitoringWorkspaceSelect
              dropdownId={`${instanceId}-workspace`}
              workspaces={monitoring.workspaces}
              selectedWorkspace={selectedWorkspace}
              onChange={setSelectedWorkspace}
            />
          }
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
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.AdminPanel),
        },
        {
          children: t`Admin Panel - Apps`,
          href: APPLICATION_REGISTRATION_ADMIN_PATH,
        },
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
