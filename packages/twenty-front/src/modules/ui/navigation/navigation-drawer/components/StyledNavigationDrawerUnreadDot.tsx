import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

// Marks an icon as unread where no label can show it, so its parent must be
// positioned
export const StyledNavigationDrawerUnreadDot = styled.span`
  background: ${themeCssVariables.color.blue};
  border-radius: 50%;
  height: 6px;
  position: absolute;
  right: -2px;
  top: -2px;
  width: 6px;
`;
