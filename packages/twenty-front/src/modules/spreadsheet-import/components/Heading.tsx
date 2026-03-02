import React from 'react';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export type HeadingProps = {
  title: string;
  description?: string;
  className?: string;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const StyledTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  text-align: center;
`;

const StyledDescription = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
  margin-top: ${themeCssVariables.spacing[3]};
  text-align: center;
`;

export const Heading = ({ title, description, className }: HeadingProps) => (
  <StyledContainer className={className}>
    <StyledTitle>{title}</StyledTitle>
    {description && <StyledDescription>{description}</StyledDescription>}
  </StyledContainer>
);
