import { SettingsAdminTabSkeletonLoader } from '@/settings/admin-panel/components/SettingsAdminTabSkeletonLoader';
import { SettingsHealthStatusListCard } from '@/settings/admin-panel/health-status/components/SettingsHealthStatusListCard';
import { t } from '@lingui/core/macro';
import { useGetSystemHealthStatusQuery } from '~/generated/graphql';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

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
        <SettingsHealthStatusListCard
          services={services}
          loading={loadingHealthStatus}
        />
      </Section>
    </>
  );
};
