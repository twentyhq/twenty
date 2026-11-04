import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

export const StyledRecordFormFieldBox = styled.div<{ hasError?: boolean }>`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: inset 0 0 0 1px
    ${({ hasError }) =>
      hasError
        ? themeCssVariables.border.color.danger
        : themeCssVariables.border.color.medium};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;

  &:has(input:focus-visible) {
    box-shadow: inset 0 0 0 1px
      ${({ hasError }) =>
        hasError
          ? themeCssVariables.border.color.danger
          : themeCssVariables.color.blue};
  }
`;
