import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// A native select: twenty-ui's Select is a base-ui control whose click
// handler needs PointerEvent, which the front component sandbox lacks.
export const SlackNativeSelect = styled.select`
  background-color: ${() => themeCssVariables.background.transparent.lighter};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.md};
  box-sizing: border-box;
  color: ${() => themeCssVariables.font.color.primary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  height: 32px;
  outline: none;
  padding: 0 ${() => themeCssVariables.spacing[2]};
  width: 100%;

  &:disabled {
    color: ${() => themeCssVariables.font.color.tertiary};
  }

  &:focus {
    border-color: ${() => themeCssVariables.color.blue};
  }
`;
