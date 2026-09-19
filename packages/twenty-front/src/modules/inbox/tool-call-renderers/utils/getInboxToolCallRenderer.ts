import { INBOX_TOOL_CALL_RENDERERS } from '@/inbox/tool-call-renderers/constants/InboxToolCallRenderers';
import { type InboxToolCallRenderer } from '@/inbox/tool-call-renderers/types/InboxToolCallRenderer';

// A tool with no renderer of its own gets the schema form, which covers any
// input a producer can declare.
export const getInboxToolCallRenderer = (
  toolName: string,
): InboxToolCallRenderer | undefined => INBOX_TOOL_CALL_RENDERERS[toolName];
