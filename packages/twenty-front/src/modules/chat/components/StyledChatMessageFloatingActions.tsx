import { styled } from '@linaria/react';

import { themeCssVariables } from 'twenty-ui/theme';

export const StyledChatMessageFloatingActions = styled.div<{
  isAtStart: boolean;
}>`
  left: ${({ isAtStart }) => (isAtStart ? '0' : 'auto')};
  opacity: 0;
  pointer-events: none;
  position: absolute;
  right: ${({ isAtStart }) => (isAtStart ? 'auto' : '0')};
  top: calc(-1 * ${themeCssVariables.spacing[4]});
  transition: opacity calc(${themeCssVariables.animation.duration.normal} * 1s)
    ease-in-out;
  z-index: 1;
`;
