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
`;
