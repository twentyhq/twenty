import { StyledTextInput } from '@/ui/field/input/components/TextInput';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

export const StyledFieldInputInlineContainer = styled.div`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: inset 0 0 0 1px ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;

  &:has(${StyledTextInput}:focus-visible) {
    box-shadow: inset 0 0 0 1px ${themeCssVariables.color.blue};
  }

  &:has(input:-webkit-autofill) {
    background-color: ${themeCssVariables.background.transparent.blue};
  }

  & input:-webkit-autofill {
    -webkit-text-fill-color: ${themeCssVariables.font.color.primary};
    transition: background-color 0s 600000s;
  }
`;
