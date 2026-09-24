import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const SlackUserLinkFormHint = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
`;
