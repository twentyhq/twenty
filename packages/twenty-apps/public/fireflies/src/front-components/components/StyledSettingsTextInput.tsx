import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// Mirrors the `lg` size variant of twenty-front's TextInput, which the native
// application settings tab renders. Data attributes are used for the modifier
// so they survive the front-component sandbox boundary, which only forwards
// declared properties plus aria-/data- attributes.
export const StyledSettingsTextInput = styled.input`
  background-color: ${() => themeCssVariables.background.transparent.lighter};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.md};
  box-sizing: border-box;
  color: ${() => themeCssVariables.font.color.primary};
  display: flex;
  flex-grow: 1;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.md};
  font-weight: ${() => themeCssVariables.font.weight.regular};
  height: 32px;
  outline: none;
  padding: ${() => themeCssVariables.spacing[2]};
  text-overflow: ellipsis;
  width: 100%;

  &[data-has-trailing-icon='true'] {
    padding-right: calc(${() => themeCssVariables.spacing[3]} + 16px);
  }

  &::placeholder,
  &::-webkit-input-placeholder {
    color: ${() => themeCssVariables.font.color.light};
    font-family: ${() => themeCssVariables.font.family};
    font-weight: ${() => themeCssVariables.font.weight.medium};
  }

  &:disabled {
    color: ${() => themeCssVariables.font.color.tertiary};
  }

  &[readonly] {
    pointer-events: none;
  }

  &:focus {
    border-color: ${() => themeCssVariables.color.blue};
  }
`;
