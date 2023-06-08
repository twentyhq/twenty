import styled from '@emotion/styled';
import { DroppableProvided } from '@hello-pangea/dnd';

import { NewButton } from './BoardNewButton';

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
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
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const ItemContainer = styled.div``;

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
    <StyledColumn>
      <StyledColumnTitle color={colorCode}>• {title}</StyledColumnTitle>
      <ItemContainer
        ref={droppableProvided.innerRef}
        {...droppableProvided.droppableProps}
      >
        {children}
        {droppableProvided.placeholder}
        <NewButton />
      </ItemContainer>
    </StyledColumn>
  );
};
