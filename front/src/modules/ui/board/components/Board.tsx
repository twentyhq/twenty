import styled from '@emotion/styled';
import { DropResult } from '@hello-pangea/dnd'; // Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350

export const StyledBoard = styled.div`
  border-radius: ${({ theme }) => theme.spacing(2)};
  display: flex;
  flex-direction: row;
  height: calc(100%);
  overflow-x: auto;
  width: 100%;
`;

export type Column = {
  id: string;
  title: string;
  colorCode?: string;
  itemKeys: string[];
};

export function getOptimisticlyUpdatedBoard(
  board: Column[],
  result: DropResult,
) {
  const newBoard = JSON.parse(JSON.stringify(board));
  const { destination, source } = result;
  if (!destination) return;
  const sourceColumnIndex = newBoard.findIndex(
    (column: Column) => column.id === source.droppableId,
  );
  const sourceColumn = newBoard[sourceColumnIndex];
  const destinationColumnIndex = newBoard.findIndex(
    (column: Column) => column.id === destination.droppableId,
  );
  const destinationColumn = newBoard[destinationColumnIndex];
  if (!destinationColumn || !sourceColumn) return;
  const sourceItems = sourceColumn.itemKeys;
  const destinationItems = destinationColumn.itemKeys;

  const [removed] = sourceItems.splice(source.index, 1);
  destinationItems.splice(destination.index, 0, removed);

  const newSourceColumn = {
    ...sourceColumn,
    itemKeys: sourceItems,
  };

  const newDestinationColumn = {
    ...destinationColumn,
    itemKeys: destinationItems,
  };

  newBoard.splice(sourceColumnIndex, 1, newSourceColumn);
  newBoard.splice(destinationColumnIndex, 1, newDestinationColumn);
  return newBoard;
}
