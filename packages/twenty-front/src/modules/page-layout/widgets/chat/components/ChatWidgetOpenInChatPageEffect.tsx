import { useEffect } from 'react';

import { useProjectAiChatThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';

type ChatWidgetOpenInChatPageEffectProps = {
  threadId: string;
};

// The chat page and the side panel would share one current chat, so a chat
// opened beside the chat page moves into it
export const ChatWidgetOpenInChatPageEffect = ({
  threadId,
}: ChatWidgetOpenInChatPageEffectProps) => {
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { projectAiChatThreadToUrl } = useProjectAiChatThreadToUrl();

  useEffect(() => {
    void closeSidePanelMenu();
    projectAiChatThreadToUrl(threadId);
  }, [closeSidePanelMenu, projectAiChatThreadToUrl, threadId]);

  return null;
};
