import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminTabSkeletonLoader } from '@/settings/admin-panel/components/SettingsAdminTabSkeletonLoader';
import { SettingsAdminHealthStatusListCard } from '@/settings/admin-panel/health-status/components/SettingsAdminHealthStatusListCard';
import { SettingsAdminMaintenanceModeFetchEffect } from '@/settings/admin-panel/health-status/maintenance-mode/components/SettingsAdminMaintenanceModeFetchEffect';
import { SettingsAdminMaintenanceMode } from '@/settings/admin-panel/health-status/maintenance-mode/components/SettingsAdminMaintenanceMode';
import { t } from '@lingui/core/macro';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { useQuery } from '@apollo/client/react';
import { GetSystemHealthStatusDocument } from '~/generated-admin/graphql';

export const SettingsAdminHealthStatus = () => {
  const apolloAdminClient = useApolloAdminClient();
  const { data, loading: loadingHealthStatus } = useQuery(
    GetSystemHealthStatusDocument,
    {
      client: apolloAdminClient,
      fetchPolicy: 'network-only',
    },
  );

  const services = data?.getSystemHealthStatus.services ?? [];

  if (loadingHealthStatus) {
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
      <SettingsAdminMaintenanceMode />
    </>
  );
};
