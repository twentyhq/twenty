import { SettingsHealthStatusListCard } from '@/settings/admin-panel/health-status/components/SettingsHealthStatusListCard';
import { H2Title, Section } from 'twenty-ui';
import { useGetSystemHealthStatusQuery } from '~/generated/graphql';

export const SettingsAdminHealthStatus = () => {
  const { data, loading } = useGetSystemHealthStatusQuery({
    fetchPolicy: 'network-only',
  });

  const services = data?.getSystemHealthStatus.services ?? [];
  return (
    <>
      <Section>
        <H2Title title="Health Status" description="How your system is doing" />
        <SettingsHealthStatusListCard services={services} loading={loading} />
      </Section>
    </>
  );
};
