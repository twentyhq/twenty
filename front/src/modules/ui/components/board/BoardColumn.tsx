import styled from '@emotion/styled';
import { DroppableProvided } from '@hello-pangea/dnd';

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
  children: any[];
  droppableProvided: DroppableProvided;
};

export const BoardColumn = ({
  title,
  children,
  droppableProvided,
}: BoardColumnProps) => {
  return (
    <StyledColumn
      ref={droppableProvided.innerRef}
      {...droppableProvided.droppableProps}
    >
      <h3>{title}</h3>
      {children}
      {droppableProvided.placeholder}
    </StyledColumn>
  );
};
