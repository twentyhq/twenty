import { styled } from '@linaria/react';

import { themeCssVariables } from 'twenty-ui/theme';

export const StyledChatMessageActions = styled.div<{
  isRightAligned: boolean;
}>`
  align-items: center;
  display: flex;
  flex-direction: ${({ isRightAligned }) =>
    isRightAligned ? 'row-reverse' : 'row'};
  gap: ${themeCssVariables.spacing[1]};
  opacity: 0;
  pointer-events: none;
  transition: opacity calc(${themeCssVariables.animation.duration.normal} * 1s)
    ease-in-out;

  @media (hover: none) {
    opacity: 1;
    pointer-events: auto;
  }
`;
