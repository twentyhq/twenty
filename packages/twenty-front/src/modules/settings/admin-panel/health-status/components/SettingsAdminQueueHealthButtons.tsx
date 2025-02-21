import styled from '@emotion/styled';
import { Button } from 'twenty-ui';
import {
  AdminPanelHealthServiceStatus,
  AdminPanelWorkerQueueHealth,
} from '~/generated/graphql';

const StyledQueueButtonsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(6)};
`;

const StyledQueueHealthButton = styled(Button)<{
  isSelected?: boolean;
  status: AdminPanelHealthServiceStatus;
}>`
  ${({ isSelected, theme, status }) =>
    isSelected &&
    `
    background-color: ${
      status === AdminPanelHealthServiceStatus.OPERATIONAL
        ? theme.tag.background.green
        : theme.tag.background.red
    };
  `}
`;
export const SettingsAdminQueueHealthButtons = ({
  queues,
  selectedQueue,
  toggleQueueVisibility,
}: {
  queues: AdminPanelWorkerQueueHealth[];
  selectedQueue: string | null;
  toggleQueueVisibility: (queueName: string) => void;
}) => {
  return (
    <StyledQueueButtonsRow>
      {queues.map((queue) => (
        <StyledQueueHealthButton
          key={queue.queueName}
          onClick={() => toggleQueueVisibility(queue.queueName)}
          title={queue.queueName}
          variant="secondary"
          isSelected={selectedQueue === queue.queueName}
          status={queue.status}
        />
      ))}
    </StyledQueueButtonsRow>
  );
};
