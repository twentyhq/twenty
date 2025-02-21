import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { AnimatedExpandableContainer, Status } from 'twenty-ui';
import {
  AdminPanelHealthServiceStatus,
  AdminPanelWorkerQueueHealth,
} from '~/generated/graphql';

const StyledExpandedContent = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding-top: ${({ theme }) => theme.spacing(1)};
  padding-bottom: ${({ theme }) => theme.spacing(3)};
  padding-left: ${({ theme }) => theme.spacing(3)};
  padding-right: ${({ theme }) => theme.spacing(3)};
`;

const StyledContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(5)};
`;

const StyledTableRow = styled(TableRow)`
  height: ${({ theme }) => theme.spacing(6)};
`;

const StyledQueueMetricsTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  padding-left: ${({ theme }) => theme.spacing(3)};
`;

export const SettingsAdminQueueExpandableContainer = ({
  queues,
  selectedQueue,
}: {
  queues: AdminPanelWorkerQueueHealth[];
  selectedQueue: string | null;
}) => {
  const selectedQueueData = queues.find(
    (queue) => queue.queueName === selectedQueue,
  );

  return (
    <AnimatedExpandableContainer
      isExpanded={!!selectedQueue}
      mode="fit-content"
    >
      {selectedQueueData && (
        <>
          <StyledContainer>
            <SettingsListCard
              items={[
                { ...selectedQueueData, id: selectedQueueData.queueName },
              ]}
              getItemLabel={(
                item: AdminPanelWorkerQueueHealth & { id: string },
              ) => item.queueName}
              isLoading={false}
              RowRightComponent={({
                item,
              }: {
                item: AdminPanelWorkerQueueHealth;
              }) => (
                <Status
                  color={
                    item.status === AdminPanelHealthServiceStatus.OPERATIONAL
                      ? 'green'
                      : 'red'
                  }
                  text={item.status.toLowerCase()}
                  weight="medium"
                />
              )}
            />
          </StyledContainer>
          <StyledQueueMetricsTitle> Metrics:</StyledQueueMetricsTitle>
          <StyledExpandedContent>
            <Table>
              <StyledTableRow>
                <TableCell align="left">Workers</TableCell>
                <TableCell align="right">{selectedQueueData.workers}</TableCell>
              </StyledTableRow>
              {Object.entries(selectedQueueData.metrics)
                .filter(([key]) => key !== '__typename')
                .map(([key, value]) => (
                  <StyledTableRow key={key}>
                    <TableCell align="left">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </TableCell>
                    <TableCell align="right">{value}</TableCell>
                  </StyledTableRow>
                ))}
            </Table>
          </StyledExpandedContent>
        </>
      )}
    </AnimatedExpandableContainer>
  );
};
