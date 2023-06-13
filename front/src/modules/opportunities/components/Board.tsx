import { useCallback, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from '@hello-pangea/dnd';

import { Column, Items, StyledBoard } from '../../ui/components/board/Board';
// Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd
// https://github.com/atlassian/react-beautiful-dnd/issues/2350
import { BoardCard } from '../../ui/components/board/BoardCard';
import {
  ItemContainer,
  StyledColumn,
  StyledColumnTitle,
} from '../../ui/components/board/BoardColumn';
import { NewButton } from '../../ui/components/board/BoardNewButton';

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
            {(droppableProvided) =>
              droppableProvided && (
                <StyledColumn>
                  <StyledColumnTitle color={column.colorCode}>
                    • {column.title}
                  </StyledColumnTitle>
                  <ItemContainer droppableProvided={droppableProvided}>
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
                  </ItemContainer>
                  <NewButton />
                </StyledColumn>
              )
            }
          </Droppable>
        ))}
      </StyledBoard>
    </DragDropContext>
  );
};
