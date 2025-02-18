import { SettingsAdminQueueExpandableContainer } from '@/settings/admin-panel/components/SettingsAdminQueueExpandableContainer';
import { SettingsAdminQueueHealthButtons } from '@/settings/admin-panel/components/SettingsAdminQueueHealthButtons';
import styled from '@emotion/styled';
import { H2Title, Section } from 'twenty-ui';
import { AdminPanelIndicatorHealthStatusInputEnum } from '~/generated/graphql';
const StyledStatusContainer = styled.div``;

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
  background-color: ${({ theme }) => theme.background.quaternary};
  padding: ${({ theme }) => theme.spacing(6)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  white-space: pre-wrap;
  font-size: ${({ theme }) => theme.font.size.sm};
`;
type SettingsAdminIndicatorContentProps = {
  indicatorName: AdminPanelIndicatorHealthStatusInputEnum;
  isWorkerDown: boolean;
  loading: boolean;
  data?: {
    getIndicatorHealthStatus: {
      queues: Array<any>; // Replace 'any' with proper queue type
    };
  };
  selectedQueue: string;
  toggleQueueVisibility: (queueName: string) => void;
  formattedDetails?: React.ReactNode;
};

export const SettingsAdminIndicatorContent = ({
  indicatorName,
  isWorkerDown,
  loading,
  data,
  selectedQueue,
  toggleQueueVisibility,
  formattedDetails,
}: SettingsAdminIndicatorContentProps) => {
  switch (indicatorName) {
    case AdminPanelIndicatorHealthStatusInputEnum.WORKER:
      return (
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
                queues={data?.getIndicatorHealthStatus.queues ?? []}
                selectedQueue={selectedQueue}
                toggleQueueVisibility={toggleQueueVisibility}
              />
              <SettingsAdminQueueExpandableContainer
                queues={data?.getIndicatorHealthStatus.queues ?? []}
                selectedQueue={selectedQueue}
              />
            </>
          )}
        </Section>
      );

    default:
      return (
        <Section>
          {formattedDetails && (
            <StyledDetailsContainer>{formattedDetails}</StyledDetailsContainer>
          )}
        </Section>
      );
  }
};
