import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledChipButton = styled.button`
  background: none;
  border: none;
  border-radius: ${() => themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  max-width: 100%;
  min-width: 0;
  padding: 0;

  &:focus-visible {
    outline: 1px solid ${() => themeCssVariables.border.color.blue};
  }
`;
