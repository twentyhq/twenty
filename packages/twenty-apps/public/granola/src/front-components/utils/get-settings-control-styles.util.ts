import { themeCssVariables } from 'twenty-ui/theme';

// TODO @charlesBochet: Replace with twenty-ui Input and Select once verified in the front component sandbox.
export const getSettingsControlStyles = () => `
  background-color: ${themeCssVariables.background.transparent.light};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  outline: none;
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;

  &::placeholder,
  &::-webkit-input-placeholder {
    color: ${themeCssVariables.font.color.tertiary};
    font-family: ${themeCssVariables.font.family};
    font-weight: ${themeCssVariables.font.weight.medium};
  }

  &:disabled {
    color: ${themeCssVariables.font.color.secondary};
  }

  &[readonly] {
    pointer-events: none;
  }

  &:focus {
    border-color: ${themeCssVariables.color.blue};
  }
`;
