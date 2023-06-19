import styled from '@emotion/styled';
import { DraggableProvided } from '@hello-pangea/dnd'; // Atlassian dnd does not support StrictMode from RN 18, so we use a fork @hello-pangea/dnd https://github.com/atlassian/react-beautiful-dnd/issues/2350

const StyledCard = styled.div`
  background-color: ${({ theme }) => theme.secondaryBackground};
  border: 1px solid ${({ theme }) => theme.quaternaryBackground};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.boxShadow};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  max-width: 300px;
`;

type BoardCardProps = {
  children: React.ReactNode;
  draggableProvided?: DraggableProvided;
};

export const BoardItem = ({ children, draggableProvided }: BoardCardProps) => {
  return (
    <StyledCard
      ref={draggableProvided?.innerRef}
      {...draggableProvided?.dragHandleProps}
      {...draggableProvided?.draggableProps}
    >
      {children}
    </StyledCard>
  );
};
