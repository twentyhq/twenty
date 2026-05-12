import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminHealthStatusListCard } from '@/settings/admin-panel/health-status/components/SettingsAdminHealthStatusListCard';
import { SettingsAdminUpgradeStatusListCard } from '@/settings/admin-panel/health-status/components/SettingsAdminUpgradeStatusListCard';
import { SettingsAdminMaintenanceMode } from '@/settings/admin-panel/health-status/maintenance-mode/components/SettingsAdminMaintenanceMode';
import { SettingsAdminMaintenanceModeFetchEffect } from '@/settings/admin-panel/health-status/maintenance-mode/components/SettingsAdminMaintenanceModeFetchEffect';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import {
  GetInstanceAndAllWorkspacesUpgradeStatusDocument,
  GetSystemHealthStatusDocument,
} from '~/generated-admin/graphql';

export const SettingsAdminHealthStatus = () => {
  const apolloAdminClient = useApolloAdminClient();
  const { data, loading: loadingHealthStatus } = useQuery(
    GetSystemHealthStatusDocument,
    {
      client: apolloAdminClient,
      fetchPolicy: 'network-only',
    },
  );
  const { data: upgradeStatusData, loading: loadingUpgradeStatus } = useQuery(
    GetInstanceAndAllWorkspacesUpgradeStatusDocument,
    {
      client: apolloAdminClient,
      fetchPolicy: 'network-only',
    },
  );

  const services = data?.getSystemHealthStatus.services ?? [];
  const upgradeStatus =
    upgradeStatusData?.getInstanceAndAllWorkspacesUpgradeStatus;

  if (loadingHealthStatus || loadingUpgradeStatus) {
    return <SettingsSectionSkeletonLoader />;
  }

  return (
    <>
      <SettingsAdminMaintenanceModeFetchEffect />
      <Section>
        <H2Title
          title={t`Health Status`}
          description={t`How your system is doing`}
        />
        <SettingsAdminHealthStatusListCard
          services={services}
          loading={loadingHealthStatus}
        />
      </Section>
      {upgradeStatus && (
        <Section>
          <H2Title
            title={t`Upgrade Status`}
            description={t`Upgrade health across instance and workspaces`}
          />
          <SettingsAdminUpgradeStatusListCard upgradeStatus={upgradeStatus} />
        </Section>
      )}
      <SettingsAdminMaintenanceMode />
    </>
  );
};
