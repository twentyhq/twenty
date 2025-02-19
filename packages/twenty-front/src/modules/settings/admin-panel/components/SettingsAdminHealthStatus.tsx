import { SettingsAdminHealthMessageSyncCountersTable } from '@/settings/admin-panel/components/SettingsAdminHealthMessageSyncCountersTable';
import { SettingsHealthStatusListCard } from '@/settings/admin-panel/components/SettingsHealthStatusListCard';
import { AdminHealthService } from '@/settings/admin-panel/types/AdminHealthService';
import styled from '@emotion/styled';
import { H2Title, Section } from 'twenty-ui';
import {
  AdminPanelHealthServiceStatus,
  useGetSystemHealthStatusQuery,
} from '~/generated/graphql';

const StyledErrorMessage = styled.div`
  color: ${({ theme }) => theme.color.red};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsAdminHealthStatus = () => {
  const { data, loading } = useGetSystemHealthStatusQuery({
    fetchPolicy: 'network-only',
  });

  const services = [
    {
      id: 'DATABASE',
      name: 'Database Status',
      ...data?.getSystemHealthStatus.database,
    },
    { id: 'REDIS', name: 'Redis Status', ...data?.getSystemHealthStatus.redis },
    {
      id: 'WORKER',
      name: 'Worker Status',
      status: data?.getSystemHealthStatus.worker.status,
      queues: data?.getSystemHealthStatus.worker.queues,
    },
  ].filter((service): service is AdminHealthService => !!service.status);

  const isMessageSyncCounterDown =
    !data?.getSystemHealthStatus.messageSync.status ||
    data?.getSystemHealthStatus.messageSync.status ===
      AdminPanelHealthServiceStatus.OUTAGE;

  return (
    <>
      <Section>
        <H2Title title="Health Status" description="How your system is doing" />
        <SettingsHealthStatusListCard services={services} loading={loading} />
      </Section>

      <Section>
        <H2Title
          title="Message Sync Status"
          description="How your message sync is doing"
        />
        {isMessageSyncCounterDown ? (
          <StyledErrorMessage>
            {data?.getSystemHealthStatus.messageSync.details ||
              'Message sync status is unavailable'}
          </StyledErrorMessage>
        ) : (
          <SettingsAdminHealthMessageSyncCountersTable
            details={data?.getSystemHealthStatus.messageSync.details}
          />
        )}
      </Section>
    </>
  );
};
