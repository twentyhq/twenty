import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import styled from '@emotion/styled';

import { BoardCard } from './BoardCard';
import { BoardColumn } from './BoardColumn';

const StyledBoard = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
`;

const columns = [
  {
    id: 'column-1',
    title: 'Column 1',
    items: [
      { id: 'item-1', content: 'Item 1' },
      { id: 'item-2', content: 'Item 2' },
      { id: 'item-3', content: 'Item 3' },
      { id: 'item-4', content: 'Item 4' },
    ],
  },
  {
    id: 'column-2',
    title: 'Column 2',
    items: [
      { id: 'item-5', content: 'Item 5' },
      { id: 'item-6', content: 'Item 6' },
    ],
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
                  {column.items.map((item, index) => (
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
