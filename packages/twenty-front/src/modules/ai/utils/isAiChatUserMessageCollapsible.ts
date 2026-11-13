import { AI_CHAT_USER_MESSAGE_COLLAPSE_THRESHOLD_LINE_COUNT } from '@/ai/constants/AiChatUserMessageCollapseThresholdLineCount';

export const isAiChatUserMessageCollapsible = ({
  contentHeightInPx,
  lineHeightInPx,
}: {
  contentHeightInPx: number;
  lineHeightInPx: number;
}) =>
  Math.round(contentHeightInPx / lineHeightInPx) >
  AI_CHAT_USER_MESSAGE_COLLAPSE_THRESHOLD_LINE_COUNT;
