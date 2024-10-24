import styled from '@emotion/styled';
import React from 'react';

const StyledHeader = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(6)};
`;

const StyledHeaderTitle = styled.p`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  font-size: ${({ theme }) => theme.font.size.xl};

  margin: ${({ theme }) => theme.spacing(3)} 0;
`;

const StyledHeaderType = styled.p`
  color: ${({ theme }) => theme.font.color.tertiary};
  margin: 0;
`;

const StyledHeaderIconContainer = styled.div`
  align-self: flex-start;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.xs};
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledContentContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(6)};
  display: flex;
  flex-direction: column;
  row-gap: ${({ theme }) => theme.spacing(4)};
`;

export const WorkflowEditGenericFormBase = ({
  HeaderIcon,
  headerTitle,
  headerType,
  children,
}: {
  HeaderIcon: React.ReactNode;
  headerTitle: string;
  headerType: string;
  children: React.ReactNode;
}) => {
  return (
    <>
      <StyledHeader>
        <StyledHeaderIconContainer>{HeaderIcon}</StyledHeaderIconContainer>

        <StyledHeaderTitle>{headerTitle}</StyledHeaderTitle>

        <StyledHeaderType>{headerType}</StyledHeaderType>
      </StyledHeader>

      <StyledContentContainer>{children}</StyledContentContainer>
    </>
  );
};
