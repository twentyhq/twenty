import styled from '@emotion/styled';
import { DropResult } from '@hello-pangea/dnd'; // Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350

export const StyledBoard = styled.div`
  border-radius: ${({ theme }) => theme.spacing(2)};
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  padding-left: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export type BoardPipelineStageColumn = {
  pipelineStageId: string;
  title: string;
  index: number;
  colorCode?: string;
  pipelineProgressIds: string[];
};

export function getOptimisticlyUpdatedBoard(
  board: BoardPipelineStageColumn[],
  result: DropResult,
) {
  const newBoard = JSON.parse(JSON.stringify(board));
  const { destination, source } = result;
  if (!destination) return;
  const sourceColumnIndex = newBoard.findIndex(
    (column: BoardPipelineStageColumn) =>
      column.pipelineStageId === source.droppableId,
  );
  const sourceColumn = newBoard[sourceColumnIndex];
  const destinationColumnIndex = newBoard.findIndex(
    (column: BoardPipelineStageColumn) =>
      column.pipelineStageId === destination.droppableId,
  );
  const destinationColumn = newBoard[destinationColumnIndex];
  if (!destinationColumn || !sourceColumn) return;
  const sourceItems = sourceColumn.pipelineProgressIds;
  const destinationItems = destinationColumn.pipelineProgressIds;

  const [removed] = sourceItems.splice(source.index, 1);
  destinationItems.splice(destination.index, 0, removed);

  const newSourceColumn: BoardPipelineStageColumn = {
    ...sourceColumn,
    pipelineProgressIds: sourceItems,
  };

  const newDestinationColumn = {
    ...destinationColumn,
    pipelineProgressIds: destinationItems,
  };

  newBoard.splice(sourceColumnIndex, 1, newSourceColumn);
  newBoard.splice(destinationColumnIndex, 1, newDestinationColumn);
  return newBoard;
}
