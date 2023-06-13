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

export const StyledColumnTitle = styled.h3`
  font-family: 'Inter';
  font-style: normal;
  font-weight: ${({ theme }) => theme.fontWeightMedium};
  font-size: ${({ theme }) => theme.fontSizeMedium};
  line-height: ${({ theme }) => theme.lineHeight};
  color: ${({ color }) => color};
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
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
      ref={droppableProvided?.innerRef}
      {...droppableProvided?.droppableProps}
    >
      {children}
      {droppableProvided?.placeholder}
    </StyledItemContainer>
  );
};
