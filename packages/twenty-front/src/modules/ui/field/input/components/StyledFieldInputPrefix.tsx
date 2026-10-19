import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

export const StyledFieldInputPrefix = styled.span`
  align-items: center;
  align-self: stretch;
  border-right: 1px solid ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  width: ${themeCssVariables.spacing[8]};
`;
