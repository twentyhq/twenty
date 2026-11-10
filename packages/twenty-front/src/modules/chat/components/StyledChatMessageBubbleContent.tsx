import { styled } from '@linaria/react';

import { themeCssVariables } from 'twenty-ui/theme';

export const StyledChatMessageBubbleContent = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  overflow-wrap: anywhere;
`;
