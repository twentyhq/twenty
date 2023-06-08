import { useCallback, useState } from 'react';
import styled from '@emotion/styled';
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from '@hello-pangea/dnd';

// Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd
// https://github.com/atlassian/react-beautiful-dnd/issues/2350
import { BoardCard } from './BoardCard';
import { BoardColumn } from './BoardColumn';

const StyledBoard = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
`;

export type ItemKey = `item-${number}`;
export interface Item {
  id: string;
  content: string;
}
export interface Items {
  [key: string]: Item;
}
export interface Column {
  id: string;
  title: string;
  itemKeys: ItemKey[];
}

type BoardProps = {
  initialBoard: Column[];
  items: Items;
};

export const Board = ({ initialBoard, items }: BoardProps) => {
  const [board, setBoard] = useState<Column[]>(initialBoard);

  const onDragEnd: OnDragEndResponder = useCallback(
    (result) => {
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
      setBoard(newBoard);
    },
    [board],
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <StyledBoard>
        {board.map((column) => (
          <Droppable key={column.id} droppableId={column.id}>
            {(provided) =>
              provided && (
                <BoardColumn title={column.title} droppableProvided={provided}>
                  {column.itemKeys.map((itemKey, index) => (
                    <Draggable
                      key={itemKey}
                      draggableId={itemKey}
                      index={index}
                    >
                      {(provided) =>
                        provided && (
                          <BoardCard
                            content={items[itemKey].content}
                            draggableProvided={provided}
                          />
                        )
                      }
                    </Draggable>
                  ))}
                </BoardColumn>
              )
            }
          </Droppable>
        ))}
      </StyledBoard>
    </DragDropContext>
  );
};
