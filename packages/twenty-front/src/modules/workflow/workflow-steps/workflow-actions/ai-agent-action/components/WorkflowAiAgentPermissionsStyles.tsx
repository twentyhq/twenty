import { styled } from '@linaria/react';
import React from 'react';
import { IconChevronRight, Label } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledText = styled.div`
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledLabelWrapper = styled.div`
  margin: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[3]}
    ${themeCssVariables.spacing[0]};
`;

export const StyledLabel = ({ children }: { children: React.ReactNode }) => (
  <StyledLabelWrapper>
    <Label>{children}</Label>
  </StyledLabelWrapper>
);

export const StyledRow = styled.div<{ isDisabled?: boolean }>`
  align-items: center;
  border-radius: ${themeCssVariables.spacing[1]};
  box-sizing: border-box;
  cursor: ${({ isDisabled }) => (isDisabled ? 'not-allowed' : 'pointer')};
  display: flex;
  justify-content: space-between;
  opacity: ${({ isDisabled }) => (isDisabled ? 0.5 : 1)};
  padding: ${themeCssVariables.spacing[1]};
  pointer-events: ${({ isDisabled }) => (isDisabled ? 'none' : 'auto')};
  width: 100%;

  :hover {
    background-color: ${({ isDisabled }) =>
      isDisabled ? 'inherit' : themeCssVariables.background.transparent.light};
  }

  :hover [data-delete-button] {
    opacity: 1;
  }
`;

export const StyledDeleteButton = styled.div`
  opacity: 0;
  transition: opacity ${themeCssVariables.animation.duration.fast}ms;
`;

export const StyledRowLeftContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[0.5]};
  padding: ${themeCssVariables.spacing[2]};
`;

export const StyledIconContainer = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.spacing[1]};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledIconChevronRightWrapper = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: inline-flex;
`;

export const StyledIconChevronRight = ({
  size,
  color,
  stroke,
}: React.ComponentProps<typeof IconChevronRight>) => (
  <StyledIconChevronRightWrapper>
    <IconChevronRight size={size} color={color} stroke={stroke} />
  </StyledIconChevronRightWrapper>
);
