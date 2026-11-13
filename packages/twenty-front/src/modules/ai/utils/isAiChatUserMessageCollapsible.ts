import { INBOX_USER_MESSAGE_COLLAPSE_THRESHOLD_LINE_COUNT } from '@/ai/constants/AiChatUserMessageCollapseThresholdLineCount';

export const isInboxUserMessageCollapsible = ({
  contentHeightInPx,
  lineHeightInPx,
}: {
  contentHeightInPx: number;
  lineHeightInPx: number;
}) =>
  Math.round(contentHeightInPx / lineHeightInPx) >
  INBOX_USER_MESSAGE_COLLAPSE_THRESHOLD_LINE_COUNT;
