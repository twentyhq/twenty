import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

export const EmailSidePanelHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[4]};
`;
