import { useEffect } from 'react';

import { useProjectInboxThreadToUrl } from '@/ai/hooks/useProjectInboxThreadToUrl';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';

type ChatWidgetOpenInChatPageEffectProps = {
  threadId: string;
};

// The chat page and side panel share one current chat, so it moves into the chat page
export const ChatWidgetOpenInChatPageEffect = ({
  threadId,
}: ChatWidgetOpenInChatPageEffectProps) => {
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { projectInboxThreadToUrl } = useProjectInboxThreadToUrl();

  useEffect(() => {
    void closeSidePanelMenu();
    projectInboxThreadToUrl(threadId);
  }, [closeSidePanelMenu, projectInboxThreadToUrl, threadId]);

  return null;
};
