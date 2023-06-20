import { useCallback, useMemo, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from '@hello-pangea/dnd'; // Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350

import {
  BoardItemKey,
  Column,
  getOptimisticlyUpdatedBoard,
  Item,
  Items,
  StyledBoard,
} from '../../ui/components/board/Board';
import {
  ItemsContainer,
  ScrollableColumn,
  StyledColumn,
  StyledColumnTitle,
} from '../../ui/components/board/BoardColumn';
import { BoardItem } from '../../ui/components/board/BoardItem';
import { NewButton } from '../../ui/components/board/BoardNewButton';

import { BoardCard } from './BoardCard';

type BoardProps = {
  initialBoard: Column[];
  items: Items;
  onUpdate?: (itemKey: BoardItemKey, columnId: Column['id']) => Promise<void>;
  onClickNew?: (
    columnId: Column['id'],
    newItem: Partial<Item> & { id: string },
  ) => void;
};

export const Board = ({
  initialBoard,
  items,
  onUpdate,
  onClickNew,
}: BoardProps) => {
  const [board, setBoard] = useState<Column[]>(initialBoard);

  const onClickFunctions = useMemo<
    Record<Column['id'], (newItem: Partial<Item> & { id: string }) => void>
  >(() => {
    return board.reduce((acc, column) => {
      acc[column.id] = (newItem: Partial<Item> & { id: string }) => {
        onClickNew && onClickNew(column.id, newItem);
      };
      return acc;
    }, {} as Record<Column['id'], (newItem: Partial<Item> & { id: string }) => void>);
  }, [board, onClickNew]);

  const onDragEnd: OnDragEndResponder = useCallback(
    async (result) => {
      const newBoard = getOptimisticlyUpdatedBoard(board, result);
      if (!newBoard) return;
      setBoard(newBoard);
      try {
        const draggedEntityId = items[result.draggableId]?.id;
        const destinationColumnId = result.destination?.droppableId;
        draggedEntityId &&
          destinationColumnId &&
          onUpdate &&
          (await onUpdate(draggedEntityId, destinationColumnId));
      } catch (e) {
        console.error(e);
      }
    },
    [board, onUpdate, items],
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
                <ScrollableColumn>
                  <ItemsContainer droppableProvided={droppableProvided}>
                    {column.itemKeys.map((itemKey, index) => (
                      <Draggable
                        key={itemKey}
                        draggableId={itemKey}
                        index={index}
                      >
                        {(draggableProvided) => (
                          <BoardItem draggableProvided={draggableProvided}>
                            <BoardCard item={items[itemKey]} />
                          </BoardItem>
                        )}
                      </Draggable>
                    ))}
                  </ItemsContainer>
                  <NewButton onClick={onClickFunctions[column.id]} />
                </ScrollableColumn>
              </StyledColumn>
            )}
          </Droppable>
        ))}
      </DragDropContext>
    </StyledBoard>
  );
};
