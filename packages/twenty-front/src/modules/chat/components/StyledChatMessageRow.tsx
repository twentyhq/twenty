import { styled } from '@linaria/react';

export const StyledChatMessageRow = styled.div<{ isRightAligned: boolean }>`
  align-items: ${({ isRightAligned }) =>
    isRightAligned ? 'flex-end' : 'flex-start'};
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;

  &:hover .message-actions,
  &:focus-within .message-actions {
    opacity: 1;
    pointer-events: auto;
  }
`;
