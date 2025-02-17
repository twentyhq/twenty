import { SettingsAdminHealthMessageSyncCountersTable } from '@/settings/admin-panel/components/SettingsAdminHealthMessageSyncCountersTable';
import { SettingsAdminQueueExpandableContainer } from '@/settings/admin-panel/components/SettingsAdminQueueExpandableContainer';
import { SettingsAdminQueueHealthButtons } from '@/settings/admin-panel/components/SettingsAdminQueueHealthButtons';
import { SettingsHealthStatusListCard } from '@/settings/admin-panel/components/SettingsHealthStatusListCard';
import { AdminHealthService } from '@/settings/admin-panel/types/AdminHealthService';
import styled from '@emotion/styled';
import { useState } from 'react';
import { H2Title, IconChevronRight, Section } from 'twenty-ui';
import {
  AdminPanelHealthServiceStatus,
  useGetSystemHealthStatusQuery,
} from '~/generated/graphql';

const StyledTransitionedIconChevronRight = styled(IconChevronRight)`
  cursor: pointer;
  transform: ${({ $isExpanded }: { $isExpanded: boolean }) =>
    $isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'};
  transition: ${({ theme }) =>
    `transform ${theme.animation.duration.normal}s ease`};
`;

const StyledWorkerSectionHeader = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
`;

const StyledTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const StyledErrorMessage = styled.div`
  color: ${({ theme }) => theme.color.red};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledDetailsContainer = styled.pre`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  margin-top: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
  white-space: pre-wrap;
`;

export const SettingsAdminHealthStatus = () => {
  const { data, loading } = useGetSystemHealthStatusQuery({
    fetchPolicy: 'network-only',
  });

  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const toggleQueueVisibility = (queueName: string) => {
    setSelectedQueue(selectedQueue === queueName ? null : queueName);
  };

  const toggleServiceExpansion = (serviceId: string) => {
    setExpandedService(expandedService === serviceId ? null : serviceId);
  };

  const services = [
    {
      id: 'database',
      name: 'Database Status',
      ...data?.getSystemHealthStatus.database,
    },
    { id: 'redis', name: 'Redis Status', ...data?.getSystemHealthStatus.redis },
    {
      id: 'worker',
      name: 'Worker Status',
      status: data?.getSystemHealthStatus.worker.status,
      queues: data?.getSystemHealthStatus.worker.queues,
    },
  ].filter((service): service is AdminHealthService => !!service.status);

  const isWorkerDown =
    !data?.getSystemHealthStatus.worker.status ||
    data?.getSystemHealthStatus.worker.status ===
      AdminPanelHealthServiceStatus.OUTAGE;

  return (
    <>
      <Section>
        <H2Title title="Health Status" description="How your system is doing" />
        <SettingsHealthStatusListCard
          services={services}
          loading={loading}
          onServiceClick={toggleServiceExpansion}
          expandedService={expandedService}
        />
      </Section>
      <Section>
        <StyledTitleContainer>
          <H2Title
            title="Queue Status"
            description="Background job processing status and metrics"
          />
        </StyledTitleContainer>
        {isWorkerDown && !loading ? (
          <StyledErrorMessage>
            Queue information is not available because the worker is down
          </StyledErrorMessage>
        ) : (
          <>
            <SettingsAdminQueueHealthButtons
              queues={data?.getSystemHealthStatus.worker.queues ?? []}
              selectedQueue={selectedQueue}
              toggleQueueVisibility={toggleQueueVisibility}
            />
            <SettingsAdminQueueExpandableContainer
              queues={data?.getSystemHealthStatus.worker.queues ?? []}
              selectedQueue={selectedQueue}
            />
          </>
        )}
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
