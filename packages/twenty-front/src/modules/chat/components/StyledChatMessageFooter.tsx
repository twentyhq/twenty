import { styled } from '@linaria/react';

import { themeCssVariables } from 'twenty-ui/theme';

export const StyledChatMessageFooter = styled.div<{
  isSpreadOut?: boolean;
  isRightAligned: boolean;
}>`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: ${({ isRightAligned }) =>
    isRightAligned ? 'row-reverse' : 'row'};
  flex-wrap: wrap;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  justify-content: ${({ isSpreadOut }) =>
    isSpreadOut ? 'space-between' : 'flex-start'};
  margin-top: ${themeCssVariables.spacing[2]};
  width: 100%;
`;
