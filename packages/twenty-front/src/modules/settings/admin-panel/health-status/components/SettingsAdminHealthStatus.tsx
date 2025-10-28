import { SettingsAdminTabSkeletonLoader } from '@/settings/admin-panel/components/SettingsAdminTabSkeletonLoader';
import { SettingsAdminHealthStatusListCard } from '@/settings/admin-panel/health-status/components/SettingsAdminHealthStatusListCard';
import { t } from '@lingui/core/macro';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { useGetSystemHealthStatusQuery } from '~/generated-metadata/graphql';

export const SettingsAdminHealthStatus = () => {
  const { data, loading: loadingHealthStatus } = useGetSystemHealthStatusQuery({
    fetchPolicy: 'network-only',
  });

  const services = data?.getSystemHealthStatus.services ?? [];

  if (loadingHealthStatus) {
    return <SettingsAdminTabSkeletonLoader />;
  }

  return (
    <>
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
    </>
  );
};
