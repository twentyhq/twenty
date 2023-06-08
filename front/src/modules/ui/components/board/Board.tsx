import * as React from 'react';
import styled from '@emotion/styled';

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
  return (
    <StyledBoard>
      {columns.map((column) => (
        <BoardColumn title={column.title} items={items} />
      ))}
    </StyledBoard>
  );
};
