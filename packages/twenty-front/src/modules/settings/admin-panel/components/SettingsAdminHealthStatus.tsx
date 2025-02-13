import { SettingsAdminHealthMessageSyncCountersTable } from '@/settings/admin-panel/components/SettingsAdminHealthMessageSyncCountersTable';
import { SettingsHealthStatusListCard } from '@/settings/admin-panel/components/SettingsHealthStatusListCard';
import { AdminHealthService } from '@/settings/admin-panel/types/AdminHealthService';
import { H2Title, Section } from 'twenty-ui';
import { useGetSystemHealthStatusQuery } from '~/generated/graphql';

export const SettingsAdminHealthStatus = () => {
  const { data } = useGetSystemHealthStatusQuery({
    fetchPolicy: 'network-only',
  });

  const services_1 = [
    {
      id: 'database',
      name: 'Database Status',
      ...data?.getSystemHealthStatus.database,
    },
    { id: 'redis', name: 'Redis Status', ...data?.getSystemHealthStatus.redis },
  ].filter((service): service is AdminHealthService => !!service.status);

  const services_2 = [
    {
      id: 'worker',
      name: 'Worker Status',
      ...data?.getSystemHealthStatus.worker,
    },
  ].filter((service): service is AdminHealthService => !!service.status);

  return (
    <>
      <Section>
        <H2Title title="Health Status" description="How your system is doing" />
        <SettingsHealthStatusListCard services={services_1} />
      </Section>
      <Section>
        <H2Title
          title="Worker"
          description="Expand to see queue wise worker status"
        />
        <SettingsHealthStatusListCard services={services_2} expandable />
      </Section>
      <Section>
        <H2Title
          title="Message Sync Status"
          description="How your message sync is doing"
        />
        <SettingsAdminHealthMessageSyncCountersTable
          messageSync={{
            NOT_SYNCED:
              data?.getSystemHealthStatus.messageSync?.NOT_SYNCED ?? 0,
            ONGOING: data?.getSystemHealthStatus.messageSync?.ONGOING ?? 0,
            ACTIVE: data?.getSystemHealthStatus.messageSync?.ACTIVE ?? 0,
            FAILED_INSUFFICIENT_PERMISSIONS:
              data?.getSystemHealthStatus.messageSync
                ?.FAILED_INSUFFICIENT_PERMISSIONS ?? 0,
            FAILED_UNKNOWN:
              data?.getSystemHealthStatus.messageSync?.FAILED_UNKNOWN ?? 0,
          }}
        />
      </Section>
    </>
  );
};
