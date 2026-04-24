import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminTabSkeletonLoader } from '@/settings/admin-panel/components/SettingsAdminTabSkeletonLoader';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { SettingsAdminHealthStatusListCard } from '@/settings/admin-panel/health-status/components/SettingsAdminHealthStatusListCard';
import { SettingsAdminUpgradeStatusRightContainer } from '@/settings/admin-panel/health-status/components/SettingsAdminUpgradeStatusRightContainer';
import { GET_ALL_WORKSPACES_UPGRADE_STATUS } from '@/settings/admin-panel/health-status/graphql/queries/getAllWorkspacesUpgradeStatus';
import { SettingsAdminMaintenanceModeFetchEffect } from '@/settings/admin-panel/health-status/maintenance-mode/components/SettingsAdminMaintenanceModeFetchEffect';
import { SettingsAdminMaintenanceMode } from '@/settings/admin-panel/health-status/maintenance-mode/components/SettingsAdminMaintenanceMode';
import { t } from '@lingui/core/macro';
import { H2Title } from 'twenty-ui/display';
import { IconProgressCheck } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { useQuery } from '@apollo/client/react';
import { GetSystemHealthStatusDocument } from '~/generated-admin/graphql';

const ADMIN_PANEL_UPGRADE_STATUS_LINK =
  '/settings/admin-panel/health-status/upgrade-status';

export const SettingsAdminHealthStatus = () => {
  const apolloAdminClient = useApolloAdminClient();
  const { data, loading: loadingHealthStatus } = useQuery(
    GetSystemHealthStatusDocument,
    {
      client: apolloAdminClient,
      fetchPolicy: 'network-only',
    },
  );
  const { data: upgradeStatusData, loading: loadingUpgradeStatus } = useQuery<{
    getAllWorkspacesUpgradeStatus: {
      instanceUpgradeStatus: {
        health: string;
        inferredVersion: string | null;
      };
      totalCount: number;
      upToDateCount: number;
      behindCount: number;
      failedCount: number;
      workspacesBehindIds: string[];
      workspacesFailedIds: string[];
      computedAt: string;
    };
  }>(GET_ALL_WORKSPACES_UPGRADE_STATUS, {
    client: apolloAdminClient,
    fetchPolicy: 'cache-and-network',
  });

  const services = data?.getSystemHealthStatus.services ?? [];
  const upgradeStatus = upgradeStatusData?.getAllWorkspacesUpgradeStatus;

  if (loadingHealthStatus || loadingUpgradeStatus) {
    return <SettingsAdminTabSkeletonLoader />;
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
            description={t`Upgrade health across all workspaces`}
          />
          <SettingsListCard
            items={[
              {
                id: 'upgrade-status',
                label: t`Upgrade status`,
                behindCount: upgradeStatus.behindCount,
                failedCount: upgradeStatus.failedCount,
              },
            ]}
            rounded={true}
            RowIcon={IconProgressCheck}
            getItemLabel={(item) => item.label}
            RowRightComponent={({ item }) => (
              <SettingsAdminUpgradeStatusRightContainer
                behindCount={item.behindCount}
                failedCount={item.failedCount}
              />
            )}
            to={() => ADMIN_PANEL_UPGRADE_STATUS_LINK}
          />
        </Section>
      )}
      <SettingsAdminMaintenanceMode />
    </>
  );
};
