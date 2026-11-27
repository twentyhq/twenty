import { styled } from '@linaria/react';

import { AiChatSurfaceView } from '@/ai-chat/instance/components/AiChatSurfaceView';
import { AI_CHAT_SURFACE } from '@/ai-chat/constants/AiChatSurface';
import { useAskAiSidePanelThreadId } from '@/side-panel/hooks/useAskAiSidePanelThreadId';
import { askAiSidePanelThreadIdComponentState } from '@/side-panel/states/askAiSidePanelThreadIdComponentState';
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
    <StyledContainer>
      <AiChatSurfaceView
        surface={AI_CHAT_SURFACE.SIDE_PANEL}
        instanceId={sidePanelPageInstanceId}
        threadId={askAiSidePanelThreadId}
        onThreadChange={setAskAiSidePanelThreadId}
      />
    </StyledContainer>
  );
};
