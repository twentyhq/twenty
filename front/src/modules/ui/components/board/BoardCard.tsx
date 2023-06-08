import styled from '@emotion/styled';
import { DraggableProvided } from '@hello-pangea/dnd';

const StyledCard = styled.div`
  background-color: ${({ theme }) => theme.secondaryBackground};
  border: 1px solid ${({ theme }) => theme.quaternaryBackground};
  border-radius: 4px;
  padding: 16px;
  box-shadow: ${({ theme }) => theme.boxShadow};
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
