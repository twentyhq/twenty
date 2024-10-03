import styled from '@emotion/styled';
import React from 'react';

const StyledTriggerHeader = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(6)};
`;

const StyledTriggerHeaderTitle = styled.p`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  font-size: ${({ theme }) => theme.font.size.xl};

  margin: ${({ theme }) => theme.spacing(3)} 0;
`;

const StyledTriggerHeaderType = styled.p`
  color: ${({ theme }) => theme.font.color.tertiary};
  margin: 0;
`;

const StyledTriggerHeaderIconContainer = styled.div`
  align-self: flex-start;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.xs};
  padding: ${({ theme }) => theme.spacing(1)};
`;

export const WorkflowEditActionFormBase = ({
  ActionIcon,
  actionTitle,
  actionType,
  children,
}: {
  ActionIcon: React.ReactNode;
  actionTitle: string;
  actionType: string;
  children: React.ReactNode;
}) => {
  return (
    <>
      <StyledTriggerHeader>
        <StyledTriggerHeaderIconContainer>
          {ActionIcon}
        </StyledTriggerHeaderIconContainer>

        <StyledTriggerHeaderTitle>{actionTitle}</StyledTriggerHeaderTitle>

        <StyledTriggerHeaderType>{actionType}</StyledTriggerHeaderType>
      </StyledTriggerHeader>

      {children}
    </>
  );
};
