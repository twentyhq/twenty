import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

import { StyledNavigationDrawerUnreadDot } from '@/ui/navigation/navigation-drawer/components/StyledNavigationDrawerUnreadDot';

export const StyledNavigationDrawerAttentionDot = styled(
  StyledNavigationDrawerUnreadDot,
)`
  background: ${themeCssVariables.color.red};

  &[data-attention='unread'] {
    background: ${themeCssVariables.font.color.tertiary};
  }
`;
