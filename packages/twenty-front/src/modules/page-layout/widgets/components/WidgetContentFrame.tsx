import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// Containment boundary for third-party widget content, which the page cannot
// style and must not let bleed into its neighbours.
export const StyledWidgetContentFrame = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  width: 100%;
`;

export const StyledWidgetTableOutline = styled.div`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;
