import { useCallback, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  OnDragEndResponder,
} from 'react-beautiful-dnd';
import styled from '@emotion/styled';

import { BoardCard } from './BoardCard';
import { BoardColumn } from './BoardColumn';

const StyledBoard = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
`;

type ItemKey = `item-${number}`;

const items = {
  'item-1': { id: 'item-1', content: 'Item 1' },
  'item-2': { id: 'item-2', content: 'Item 2' },
  'item-3': { id: 'item-3', content: 'Item 3' },
  'item-4': { id: 'item-4', content: 'Item 4' },
  'item-5': { id: 'item-5', content: 'Item 5' },
  'item-6': { id: 'item-6', content: 'Item 6' },
} satisfies Record<ItemKey, { id: ItemKey; content: string }>;

const initialBoard = [
  {
    id: 'column-1',
    title: 'Column 1',
    itemKeys: ['item-1', 'item-2', 'item-3', 'item-4'] satisfies ItemKey[],
  },
  {
    id: 'column-2',
    title: 'Column 2',
    itemKeys: ['item-5', 'item-6'] satisfies ItemKey[],
  },
];

export const Board = () => {
  const [board] = useState(initialBoard);

  const onDragEnd: OnDragEndResponder = useCallback((result) => {
    console.log(result);
  }, []);

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
