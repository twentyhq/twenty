import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import styled from '@emotion/styled';

import { BoardCard } from './BoardCard';
import { BoardColumn } from './BoardColumn';

const StyledBoard = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
`;

const items = [
  { id: 'item-1', content: 'Item 1' },
  { id: 'item-2', content: 'Item 2' },
  { id: 'item-3', content: 'Item 3' },
  { id: 'item-4', content: 'Item 4' },
];

const columns = [
  {
    id: 'column-1',
    title: 'Column 1',
    itemIds: ['item-1', 'item-2'],
  },
];

export const Board = () => {
  const onDragEnd = (waouh: any) => {
    console.log(waouh);
  };
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <StyledBoard>
        {columns.map((column) => (
          <Droppable droppableId={column.id}>
            {(provided) =>
              provided && (
                <BoardColumn title={column.title} droppableProvided={provided}>
                  {items.map((item, index) => (
                    <Draggable draggableId={item.id} index={index}>
                      {(provided) =>
                        provided && (
                          <BoardCard
                            key={item.id}
                            content={item.content}
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
