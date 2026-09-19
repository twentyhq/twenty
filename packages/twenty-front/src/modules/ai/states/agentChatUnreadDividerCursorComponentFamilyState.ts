import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

type AgentChatUnreadDividerCursor = {
  // Distinguishes "not captured yet" from "captured, and the reader had no
  // cursor": the second is a thread they have never opened, where every
  // message is new and the divider belongs at the top.
  hasCaptured: boolean;
  lastReadAt: string | null;
};

// Opening a thread marks it read, which would move the reader's cursor past
// the messages the divider is supposed to sit above. This holds the cursor as
// it was when the thread was opened, so the line stays where it was while the
// thread is on screen.
export const agentChatUnreadDividerCursorComponentFamilyState =
  createAtomComponentFamilyState<
    AgentChatUnreadDividerCursor,
    { threadId: string | null }
  >({
    key: 'agentChatUnreadDividerCursorComponentFamilyState',
    defaultValue: { hasCaptured: false, lastReadAt: null },
    componentInstanceContext: AgentChatComponentInstanceContext,
  });
