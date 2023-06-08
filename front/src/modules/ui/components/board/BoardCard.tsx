import { DraggableProvided } from 'react-beautiful-dnd';
import styled from '@emotion/styled';

const StyledCard = styled.div`
  background-color: #ffffff;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
`;

type BoardCardProps = {
  content: string;
  draggableProvided: DraggableProvided;
};

export const BoardCard = ({ content, draggableProvided }: BoardCardProps) => {
  return (
    <StyledCard
      ref={draggableProvided?.innerRef}
      {...draggableProvided.dragHandleProps}
      {...draggableProvided.draggableProps}
    >
      {content}
    </StyledCard>
  );
};
