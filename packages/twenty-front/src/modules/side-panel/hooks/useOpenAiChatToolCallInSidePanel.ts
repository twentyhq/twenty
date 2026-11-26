import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { type IconComponent } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { aiChatToolCallPartComponentState } from '@/side-panel/states/aiChatToolCallPartComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { registerRoutedFlowStateScopeRelease } from '@/ui/utilities/state/jotai/utils/routedFlowStateScopeRegistry';

const toolCallPageIdsHoldingPart = new Set<string>();

registerRoutedFlowStateScopeRelease((scopeId) => {
  if (!toolCallPageIdsHoldingPart.delete(scopeId)) {
    return;
  }

  jotaiStore.set(
    aiChatToolCallPartComponentState.atomFamily({ instanceId: scopeId }),
    null,
  );
});

export const useOpenAiChatToolCallInSidePanel = () => {
  const store = useStore();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openAiChatToolCallInSidePanel = useCallback(
    ({
      part,
      title,
      Icon,
    }: {
      part: ToolUIPart | DynamicToolUIPart;
      title: string;
      Icon: IconComponent;
    }) => {
      const pageId = v4();

      store.set(
        aiChatToolCallPartComponentState.atomFamily({ instanceId: pageId }),
        part,
      );
      toolCallPageIdsHoldingPart.add(pageId);

      navigateSidePanelMenu({
        page: SidePanelPages.AiChatToolCall,
        pageTitle: title,
        pageIcon: Icon,
        pageId,
        routedFlowStateScopeId: pageId,
      });
    },
    [navigateSidePanelMenu, store],
  );

  return { openAiChatToolCallInSidePanel };
};
