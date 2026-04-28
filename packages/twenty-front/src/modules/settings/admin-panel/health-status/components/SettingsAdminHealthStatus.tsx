import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminHealthStatusListCard } from '@/settings/admin-panel/health-status/components/SettingsAdminHealthStatusListCard';
import { SettingsAdminUpgradeStatusRightContainer } from '@/settings/admin-panel/health-status/components/SettingsAdminUpgradeStatusRightContainer';
import { GET_ALL_WORKSPACES_UPGRADE_STATUS } from '@/settings/admin-panel/health-status/graphql/queries/getAllWorkspacesUpgradeStatus';
import { SettingsAdminMaintenanceMode } from '@/settings/admin-panel/health-status/maintenance-mode/components/SettingsAdminMaintenanceMode';
import { SettingsAdminMaintenanceModeFetchEffect } from '@/settings/admin-panel/health-status/maintenance-mode/components/SettingsAdminMaintenanceModeFetchEffect';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { SettingsPath, type UpgradeHealthEnum } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, IconProgressCheck } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { GetSystemHealthStatusDocument } from '~/generated-admin/graphql';

const ADMIN_PANEL_UPGRADE_STATUS_LINK = getSettingsPath(
  SettingsPath.AdminPanelUpgradeStatus,
);

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
        health: UpgradeHealthEnum;
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
            description={t`Upgrade health across all workspaces`}
          />
          <SettingsListCard
            items={[
              {
                id: 'upgrade-status',
                label: t`Upgrade status`,
                instanceHealth: upgradeStatus.instanceUpgradeStatus.health,
                behindCount: upgradeStatus.behindCount,
                failedCount: upgradeStatus.failedCount,
              },
            ]}
            rounded={true}
            RowIcon={IconProgressCheck}
            getItemLabel={(item) => item.label}
            RowRightComponent={({ item }) => (
              <SettingsAdminUpgradeStatusRightContainer
                instanceHealth={item.instanceHealth}
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
