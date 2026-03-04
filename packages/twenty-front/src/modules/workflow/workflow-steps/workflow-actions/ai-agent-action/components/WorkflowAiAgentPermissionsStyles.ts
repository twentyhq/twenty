import { styled } from '@linaria/react';
import { IconChevronRight, Label } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledText = styled.div`
  color: ${themeCssVariables.font.color.secondary};
`;

export const StyledLabel = styled(Label)`
  margin: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[3]}
    ${themeCssVariables.spacing[0]};
`;

export const StyledRow = styled.div<{ isDisabled?: boolean }>`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: ${themeCssVariables.spacing[1]};
  box-sizing: border-box;
  border-radius: ${themeCssVariables.spacing[1]};
  cursor: ${({ isDisabled }) => (isDisabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ isDisabled }) => (isDisabled ? 0.5 : 1)};
  pointer-events: ${({ isDisabled }) => (isDisabled ? 'none' : 'auto')};

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
  background-color: ${themeCssVariables.background.tertiary};
  padding: ${themeCssVariables.spacing[1]};
  border-radius: ${themeCssVariables.spacing[1]};
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
`;

export const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${themeCssVariables.font.color.tertiary};
`;
