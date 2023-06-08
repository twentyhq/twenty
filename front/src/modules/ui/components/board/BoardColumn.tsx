import styled from '@emotion/styled';

import { BoardCard } from './BoardCard';

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
  margin-right: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 16px;
`;

type BoardColumnProps = {
  title: string;
  items: any[];
};

export const BoardColumn = ({ title, items }: BoardColumnProps) => {
  return (
    <StyledColumn>
      <h3>{title}</h3>
      {items.map((item) => (
        <BoardCard content={item.content} />
      ))}
    </StyledColumn>
  );
};
