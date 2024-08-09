import React from 'react';
import styled from '@emotion/styled';

export type HeadingProps = {
  title: string;
  description?: string;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const StyledTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  text-align: center;
`;

const StyledDescription = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin-top: ${({ theme }) => theme.spacing(3)};
  text-align: center;
`;

export const Heading = ({ title, description }: HeadingProps) => (
  <StyledContainer>
    <StyledTitle>{title}</StyledTitle>
    {description && <StyledDescription>{description}</StyledDescription>}
  </StyledContainer>
);
