import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';

import { isClickHouseConfiguredState } from '@/client-config/states/isClickHouseConfiguredState';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminApplicationLogs } from '@/settings/admin-panel/apps/components/SettingsAdminApplicationLogs';
import { SettingsAdminApplicationMonitoringWorkspaceSelect } from '@/settings/admin-panel/apps/components/SettingsAdminApplicationMonitoringWorkspaceSelect';
import { SettingsAdminApplicationMonitoringWorkspacesTable } from '@/settings/admin-panel/apps/components/SettingsAdminApplicationMonitoringWorkspacesTable';
import { type AdminApplicationMonitoringWorkspace } from '@/settings/admin-panel/apps/types/AdminApplicationMonitoringWorkspace';
import { ApplicationMonitoring } from '@/settings/application-monitoring/components/ApplicationMonitoring';
import { ApplicationMonitoringFallback } from '@/settings/application-monitoring/components/ApplicationMonitoringFallback';
import { buildApplicationMonitoringPeriodRange } from '@/settings/application-monitoring/utils/buildApplicationMonitoringPeriodRange';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { FindAdminApplicationRegistrationMonitoringDocument } from '~/generated-admin/graphql';

export const SettingsAdminApplicationRegistrationMonitoringTab = ({
  applicationRegistrationId,
}: {
  applicationRegistrationId: string;
}) => {
  const { t } = useLingui();
  const apolloAdminClient = useApolloAdminClient();
  const isClickHouseConfigured = useAtomStateValue(isClickHouseConfiguredState);

  const [periodRange, setPeriodRange] = useState(() =>
    buildApplicationMonitoringPeriodRange('7d'),
  );
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<AdminApplicationMonitoringWorkspace>();

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
      skip: !isClickHouseConfigured,
    },
  );

  const monitoring = data?.findAdminApplicationRegistrationMonitoring;

  if (!isClickHouseConfigured || isDefined(error) || !isDefined(monitoring)) {
    return (
      <ApplicationMonitoringFallback
        isClickHouseConfigured={isClickHouseConfigured}
        hasError={isDefined(error)}
      />
    );
  }

  const instanceId = `admin-application-registration-monitoring-${applicationRegistrationId}`;
  const activeWorkspaceCountLabel = monitoring.activeWorkspaceCount.toString();

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
      <Section.Root>
        <Section.Header
          title={t`Logs`}
          description={t`Newest first, refreshed every 15 seconds`}
        />
        <SettingsAdminApplicationLogs
          instanceId={`${instanceId}-logs`}
          applicationRegistrationId={applicationRegistrationId}
          workspaceId={selectedWorkspace?.workspaceId}
          periodStart={monitoring.periodStart}
        />
      </Section.Root>
    </>
  );
};
