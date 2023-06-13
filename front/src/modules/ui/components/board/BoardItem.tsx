import styled from '@emotion/styled';
import { DraggableProvided } from '@hello-pangea/dnd';

const StyledCard = styled.div`
  background-color: ${({ theme }) => theme.secondaryBackground};
  border: 1px solid ${({ theme }) => theme.quaternaryBackground};
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 8px;
  box-shadow: ${({ theme }) => theme.boxShadow};
`;

type BoardCardProps = {
  children: React.ReactNode;
  draggableProvided: DraggableProvided;
};

export const BoardItem = ({ children, draggableProvided }: BoardCardProps) => {
  return (
    <StyledCard
      ref={draggableProvided?.innerRef}
      {...draggableProvided.dragHandleProps}
      {...draggableProvided.draggableProps}
    >
      {children}
    </StyledCard>
  );
};
