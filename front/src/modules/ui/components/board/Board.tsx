import styled from '@emotion/styled';
import { DropResult } from '@hello-pangea/dnd'; // Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350

export const StyledBoard = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
`;

export type BoardItemKey = string;
export type Item = any & { id: string };
export interface Items {
  [key: string]: Item;
}
export interface Column {
  id: string;
  title: string;
  colorCode?: string;
  itemKeys: BoardItemKey[];
}

export const getOptimisticlyUpdatedBoard = (
  board: Column[],
  result: DropResult,
) => {
  const { destination, source } = result;
  if (!destination) return;
  const sourceColumnIndex = board.findIndex(
    (column) => column.id === source.droppableId,
  );
  const sourceColumn = board[sourceColumnIndex];
  const destinationColumnIndex = board.findIndex(
    (column) => column.id === destination.droppableId,
  );
  const destinationColumn = board[destinationColumnIndex];
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

  const newBoard = [...board];
  newBoard.splice(sourceColumnIndex, 1, newSourceColumn);
  newBoard.splice(destinationColumnIndex, 1, newDestinationColumn);
  return newBoard;
};
