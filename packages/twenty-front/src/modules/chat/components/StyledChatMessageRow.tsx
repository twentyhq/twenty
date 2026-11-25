import { styled } from '@linaria/react';

import { CHAT_GROUPED_MESSAGE_GAP } from '@/chat/constants/ChatGroupedMessageGap';
import { themeCssVariables } from 'twenty-ui/theme';

export const StyledChatMessageRow = styled.div<{
  isRightAligned: boolean;
  isGroupedWithPrevious?: boolean;
  isGroupedWithNext?: boolean;
}>`
  align-items: ${({ isRightAligned }) =>
    isRightAligned ? 'flex-end' : 'flex-start'};
  display: flex;
  flex-direction: column;
  isolation: isolate;
  position: relative;
  width: 100%;

  &:focus {
    outline: none;
  }

  &:hover .message-actions,
  &:focus-within .message-actions {
    opacity: 1;
    pointer-events: auto;
  }

  &[data-hover-card]::before {
    background: ${themeCssVariables.background.transparent.light};
    border-radius: ${themeCssVariables.border.radius.md};
    bottom: ${({ isGroupedWithNext }) =>
      isGroupedWithNext
        ? `calc(${CHAT_GROUPED_MESSAGE_GAP} / -2)`
        : `calc(-1 * ${themeCssVariables.spacing[2]})`};
    content: '';
    left: calc(-1 * ${themeCssVariables.spacing[2]});
    opacity: 0;
    pointer-events: none;
    position: absolute;
    right: calc(-1 * ${themeCssVariables.spacing[2]});
    top: ${({ isGroupedWithPrevious }) =>
      isGroupedWithPrevious
        ? `calc(${CHAT_GROUPED_MESSAGE_GAP} / -2)`
        : `calc(-1 * ${themeCssVariables.spacing[2]})`};
    transition: opacity calc(${themeCssVariables.animation.duration.fast} * 1s)
      ease-in-out;
    z-index: -1;
  }

  &[data-hover-card]:hover::before {
    opacity: 1;
  }
`;
