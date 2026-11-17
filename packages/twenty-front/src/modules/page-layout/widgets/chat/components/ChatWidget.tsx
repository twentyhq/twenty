import { styled } from '@linaria/react';
import { useId } from 'react';

import { AiChatInstance } from '@/ai/components/AiChatInstance';
import { AiChatTab } from '@/ai/components/AiChatTab';
import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';

const StyledChatContainer = styled.div`
  --ai-chat-content-max-width: 768px;

  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  width: 100%;
`;

export const ChatWidget = () => {
  const instanceId = useId();
  const targetRecord = useTargetRecord();
  const isInSidePanel = useWorkspaceSurface().type === 'side-panel';
  const { handleThreadClick } = useAiChatThreadClick({
    shouldOpenInFullPage: !isInSidePanel,
  });

  return (
    <StyledChatContainer>
      <AiChatSurfaceContext.Provider
        value={
          isInSidePanel ? AI_CHAT_SURFACE.SIDE_PANEL : AI_CHAT_SURFACE.PAGE
        }
      >
        <AiChatInstance
          instanceId={instanceId}
          threadId={targetRecord.id}
          onThreadChange={(threadId) => handleThreadClick({ id: threadId })}
        >
          <AiChatTab />
        </AiChatInstance>
      </AiChatSurfaceContext.Provider>
    </StyledChatContainer>
  );
};
