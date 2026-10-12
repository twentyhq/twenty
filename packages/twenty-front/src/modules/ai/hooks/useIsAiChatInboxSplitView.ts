import { useIsMobile } from 'twenty-ui/utilities';

import { AI_CHAT_INBOX_LAYOUT } from '@/ai/constants/AiChatInboxLayout';
import { aiChatInboxLayoutState } from '@/ai/states/aiChatInboxLayoutState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// A phone has room for the list or a chat, never both
export const useIsAiChatInboxSplitView = () => {
  const isMobile = useIsMobile();
  const aiChatInboxLayout = useAtomStateValue(aiChatInboxLayoutState);

  return !isMobile && aiChatInboxLayout === AI_CHAT_INBOX_LAYOUT.SPLIT_VIEW;
};
