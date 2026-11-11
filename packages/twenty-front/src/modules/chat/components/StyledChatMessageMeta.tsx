import { styled } from '@linaria/react';

import { themeCssVariables } from 'twenty-ui/theme';

export const StyledChatMessageMeta = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[6]};
`;
