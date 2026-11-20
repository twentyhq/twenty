import { styled } from '@linaria/react';

import { AiChatInstance } from '@/ai-chat/instance/components/AiChatInstance';
import { AiChatTab } from '@/ai-chat/instance/components/AiChatTab';
import { AI_CHAT_SURFACE } from '@/ai-chat/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai-chat/contexts/AiChatSurfaceContext';
import { useAskAiSidePanelThreadId } from '@/side-panel/pages/ask-ai/hooks/useAskAiSidePanelThreadId';
import { askAiSidePanelThreadIdComponentState } from '@/side-panel/pages/ask-ai/states/askAiSidePanelThreadIdComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

const StyledContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export const SidePanelAskAiPage = () => {
  const sidePanelPageInstanceId = useAvailableComponentInstanceIdOrThrow(
    SidePanelPageComponentInstanceContext,
  );
  const askAiSidePanelThreadId = useAskAiSidePanelThreadId();
  const setAskAiSidePanelThreadId = useSetAtomComponentState(
    askAiSidePanelThreadIdComponentState,
  );

  return (
    <AiChatSurfaceContext.Provider value={AI_CHAT_SURFACE.SIDE_PANEL}>
      <AiChatInstance
        instanceId={sidePanelPageInstanceId}
        threadId={askAiSidePanelThreadId}
        onThreadChange={setAskAiSidePanelThreadId}
      >
        <StyledContainer>
          <AiChatTab />
        </StyledContainer>
      </AiChatInstance>
    </AiChatSurfaceContext.Provider>
  );
};
