import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { type IconComponent } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sidePanelAiChatToolCallComponentState } from '@/side-panel/pages/ai-chat-tool-call/states/sidePanelAiChatToolCallComponentState';

export const useOpenAiChatToolCallInSidePanel = () => {
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openAiChatToolCallInSidePanel = useCallback(
    ({
      threadId,
      toolCallId,
      title,
      Icon,
    }: {
      threadId: string;
      toolCallId: string;
      title: string;
      Icon: IconComponent;
    }) => {
      const pageId = v4();

      store.set(
        sidePanelAiChatToolCallComponentState.atomFamily({
          instanceId: pageId,
        }),
        { threadId, toolCallId },
      );

      navigateSidePanelMenu({
        page: SidePanelPages.AiChatToolCall,
        pageTitle: title,
        pageIcon: Icon,
        pageId,
      });
    },
    [navigateSidePanelMenu, store],
  );

  return { openAiChatToolCallInSidePanel };
};
