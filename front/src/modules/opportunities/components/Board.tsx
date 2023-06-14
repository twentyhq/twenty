import { useCallback, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from '@hello-pangea/dnd';

import {
  Column,
  getOptimisticlyUpdatedBoard,
  Items,
  StyledBoard,
} from '../../ui/components/board/Board';
import {
  ItemsContainer,
  StyledColumn,
  StyledColumnTitle,
} from '../../ui/components/board/BoardColumn';
// Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd
// https://github.com/atlassian/react-beautiful-dnd/issues/2350
import { BoardItem } from '../../ui/components/board/BoardItem';
import { NewButton } from '../../ui/components/board/BoardNewButton';

import { BoardCard } from './BoardCard';

type BoardProps = {
  initialBoard: Column[];
  items: Items;
};

export const Board = ({ initialBoard, items }: BoardProps) => {
  const [board, setBoard] = useState<Column[]>(initialBoard);

  const onDragEnd: OnDragEndResponder = useCallback(
    (result) => {
      const newBoard = getOptimisticlyUpdatedBoard(board, result);
      if (!newBoard) return;
      setBoard(newBoard);
      // TODO implement update board mutation
    },
    [board],
  );

  return (
    <StyledBoard>
      <DragDropContext onDragEnd={onDragEnd}>
        {board.map((column) => (
          <Droppable key={column.id} droppableId={column.id}>
            {(droppableProvided) => (
              <StyledColumn>
                <StyledColumnTitle color={column.colorCode}>
                  • {column.title}
                </StyledColumnTitle>
                <ItemsContainer droppableProvided={droppableProvided}>
                  {column.itemKeys.map((itemKey, index) => (
                    <Draggable
                      key={itemKey}
                      draggableId={itemKey}
                      index={index}
                    >
                      {(draggableProvided) => (
                        <BoardItem draggableProvided={draggableProvided}>
                          <BoardCard>
                            {items[itemKey]?.id || 'Item not found'}
                          </BoardCard>
                        </BoardItem>
                      )}
                    </Draggable>
                  ))}
                </ItemsContainer>
                <NewButton />
              </StyledColumn>
            )}
          </Droppable>
        ))}
      </DragDropContext>
    </StyledBoard>
  );
};
