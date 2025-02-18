import { SettingsHealthStatusListCard } from '@/settings/admin-panel/health-status/components/SettingsHealthStatusListCard';
import { AdminHealthService } from '@/settings/admin-panel/types/AdminHealthService';
import { H2Title, Section } from 'twenty-ui';
import { useGetSystemHealthStatusQuery } from '~/generated/graphql';

export const SettingsAdminHealthStatus = () => {
  const { data, loading } = useGetSystemHealthStatusQuery({
    fetchPolicy: 'network-only',
  });

  const services = [
    {
      id: 'DATABASE',
      name: 'Database Status',
      status: data?.getSystemHealthStatus.database,
    },
    {
      id: 'REDIS',
      name: 'Redis Status',
      status: data?.getSystemHealthStatus.redis,
    },
    {
      id: 'WORKER',
      name: 'Worker Status',
      status: data?.getSystemHealthStatus.worker,
    },
    {
      id: 'ACCOUNT_SYNC',
      name: 'Account Sync Metrics',
      status: data?.getSystemHealthStatus.accountSync,
    },
  ].filter((service): service is AdminHealthService => !!service.status);

  return (
    <>
      <Section>
        <H2Title title="Health Status" description="How your system is doing" />
        <SettingsHealthStatusListCard services={services} loading={loading} />
      </Section>
    </>
  );
};
