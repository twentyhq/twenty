import { styled } from '@linaria/react';

import { CHAT_MESSAGE_BUBBLE_MAX_WIDTH } from '@/activities/emails/constants/ChatMessageBubbleMaxWidth';
import { themeCssVariables } from 'twenty-ui/theme';

export const StyledChatMessageBubble = styled.div<{
  isOutgoing: boolean;
  isDimmed?: boolean;
}>`
  background: ${({ isOutgoing }) =>
    isOutgoing
      ? themeCssVariables.background.transparent.light
      : themeCssVariables.background.primary};
  border: 1px solid
    ${({ isOutgoing }) =>
      isOutgoing ? 'transparent' : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  max-width: ${CHAT_MESSAGE_BUBBLE_MAX_WIDTH};
  opacity: ${({ isDimmed }) => (isDimmed === true ? 0.6 : 1)};
  overflow-wrap: break-word;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  white-space: pre-line;

  a {
    color: inherit;
    text-decoration: underline;
  }
`;
