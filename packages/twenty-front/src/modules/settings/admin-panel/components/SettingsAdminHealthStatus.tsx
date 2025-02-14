import { SettingsAdminHealthMessageSyncCountersTable } from '@/settings/admin-panel/components/SettingsAdminHealthMessageSyncCountersTable';
import { SettingsAdminQueueExpandableContainer } from '@/settings/admin-panel/components/SettingsAdminQueueExpandableContainer';
import { SettingsAdminQueueHealthButtons } from '@/settings/admin-panel/components/SettingsAdminQueueHealthButtons';
import { SettingsHealthStatusListCard } from '@/settings/admin-panel/components/SettingsHealthStatusListCard';
import { AdminHealthService } from '@/settings/admin-panel/types/AdminHealthService';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import {
  AnimatedExpandableContainer,
  H2Title,
  IconChevronRight,
  Section,
} from 'twenty-ui';
import { useGetSystemHealthStatusQuery } from '~/generated/graphql';

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

export const SettingsAdminHealthStatus = () => {
  const { data, loading } = useGetSystemHealthStatusQuery({
    fetchPolicy: 'network-only',
  });

  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);

  const [isWorkerSectionExpanded, setIsWorkerSectionExpanded] = useState(false);

  const toggleWorkerSectionVisibility = () => {
    setIsWorkerSectionExpanded(!isWorkerSectionExpanded);
  };

  const toggleQueueVisibility = (queueName: string) => {
    setSelectedQueue(selectedQueue === queueName ? null : queueName);
  };

  const theme = useTheme();

  const services_1 = [
    {
      id: 'database',
      name: 'Database Status',
      ...data?.getSystemHealthStatus.database,
    },
    { id: 'redis', name: 'Redis Status', ...data?.getSystemHealthStatus.redis },
  ].filter((service): service is AdminHealthService => !!service.status);

  const service_2 = [
    {
      id: 'worker',
      name: 'Worker Status',
      status: data?.getSystemHealthStatus.worker.status,
      queues: data?.getSystemHealthStatus.worker.queues,
    },
  ].filter((service): service is AdminHealthService => !!service.status);

  return (
    <>
      <Section>
        <H2Title title="Health Status" description="How your system is doing" />
        <SettingsHealthStatusListCard services={services_1} loading={loading} />
      </Section>
      <Section>
        <StyledWorkerSectionHeader onClick={toggleWorkerSectionVisibility}>
          <StyledTitleContainer>
            <H2Title
              title="Worker"
              description="Expand to see queue wise worker status"
            />
          </StyledTitleContainer>
          <StyledTransitionedIconChevronRight
            $isExpanded={isWorkerSectionExpanded}
            size={theme.icon.size.md}
          />
        </StyledWorkerSectionHeader>
        <SettingsHealthStatusListCard services={service_2} loading={loading} />
        <AnimatedExpandableContainer
          isExpanded={isWorkerSectionExpanded}
          mode="fit-content"
        >
          <SettingsAdminQueueHealthButtons
            queues={data?.getSystemHealthStatus.worker.queues ?? []}
            selectedQueue={selectedQueue}
            toggleQueueVisibility={toggleQueueVisibility}
          />
          <SettingsAdminQueueExpandableContainer
            queues={data?.getSystemHealthStatus.worker.queues ?? []}
            selectedQueue={selectedQueue}
          />
        </AnimatedExpandableContainer>
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
