import styled from '@emotion/styled';
import { DroppableProvided } from '@hello-pangea/dnd';

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
  gap: ${({ theme }) => theme.spacing(2)};
  background-color: ${({ theme }) => theme.primaryBackground};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledColumnTitle = styled.h3`
  font-family: 'Inter';
  font-style: normal;
  font-weight: ${({ theme }) => theme.fontWeightBold};
  font-size: ${({ theme }) => theme.fontSizeMedium};
  line-height: ${({ theme }) => theme.lineHeight};
  color: ${({ color }) => color};
  margin: 0;
`;

type BoardColumnProps = {
  title: string;
  colorCode?: string;
  children: any[];
  droppableProvided: DroppableProvided;
};

export const BoardColumn = ({
  title,
  colorCode,
  children,
  droppableProvided,
}: BoardColumnProps) => {
  return (
    <StyledColumn
      ref={droppableProvided.innerRef}
      {...droppableProvided.droppableProps}
    >
      <StyledColumnTitle color={colorCode}>• {title}</StyledColumnTitle>
      {children}
      {droppableProvided.placeholder}
    </StyledColumn>
  );
};
