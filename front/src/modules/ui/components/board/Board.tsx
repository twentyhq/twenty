import * as React from 'react';
import styled from '@emotion/styled';

const StyledBoard = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
`;

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
  margin-right: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 16px;
`;

const StyledCard = styled.div`
  background-color: #ffffff;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
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
        <StyledColumn>
          <h3>{column.title}</h3>
          {items.map((item) => (
            <StyledCard>{item.content}</StyledCard>
          ))}
        </StyledColumn>
      ))}
    </StyledBoard>
  );
};
