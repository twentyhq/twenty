import React from 'react';
import styled from '@emotion/styled';
import { DroppableProvided } from '@hello-pangea/dnd';

export const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
  background-color: ${({ theme }) => theme.primaryBackground};
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const StyledItemContainer = styled.div``;

export const ItemsContainer = ({
  children,
  droppableProvided,
}: {
  children: React.ReactNode;
  droppableProvided: DroppableProvided;
}) => {
  return (
    <StyledItemContainer
      ref={droppableProvided.innerRef}
      {...droppableProvided.droppableProps}
    >
      {children}
      {droppableProvided.placeholder}
    </StyledItemContainer>
  );
};
