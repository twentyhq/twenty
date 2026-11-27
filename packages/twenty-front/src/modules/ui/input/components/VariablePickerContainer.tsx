import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledVariablePickerContainer = styled.div<{
  isReadonly?: boolean;
  multiline?: boolean;
}>`
  align-items: center;
  background-color: ${({ multiline }) =>
    multiline
      ? 'transparent'
      : themeCssVariables.background.transparent.lighter};
  border: ${({ multiline }) =>
    multiline ? 'none' : `1px solid ${themeCssVariables.border.color.medium}`};

  border-radius: ${({ multiline }) =>
    multiline
      ? themeCssVariables.border.radius.sm
      : `0 ${themeCssVariables.border.radius.md} ${themeCssVariables.border.radius.md} 0`};

  display: flex;
  height: ${({ multiline }) =>
    multiline ? themeCssVariables.spacing[7] : 'auto'};

  justify-content: center;
  margin: ${({ multiline }) =>
    multiline ? `${themeCssVariables.spacing[1]}` : '0'};

  position: ${({ multiline }) => (multiline ? 'absolute' : 'static')};
  right: ${({ multiline }) =>
    multiline ? themeCssVariables.spacing[0] : 'auto'};
  top: ${({ multiline }) =>
    multiline ? themeCssVariables.spacing[0] : 'auto'};
  width: ${({ multiline }) =>
    multiline ? themeCssVariables.spacing[7] : 'auto'};

  &:has([data-popup-open]) {
    background-color: ${themeCssVariables.background.transparent.light};
  }

  &:hover {
    background-color: ${({ isReadonly, multiline }) => {
      if (isReadonly) {
        return multiline
          ? 'transparent'
          : themeCssVariables.background.transparent.lighter;
      }
      return themeCssVariables.background.transparent.light;
    }};
  }

  &:has([data-popup-open]):hover {
    background-color: ${themeCssVariables.background.transparent.medium};
  }
`;

export { StyledVariablePickerContainer as VariablePickerContainer };
