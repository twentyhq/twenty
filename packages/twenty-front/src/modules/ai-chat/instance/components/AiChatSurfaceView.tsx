import { AiChatSurfaceContext } from '@/ai-chat/contexts/AiChatSurfaceContext';
import { AiChatInstance } from '@/ai-chat/instance/components/AiChatInstance';
import { AiChatTab } from '@/ai-chat/instance/components/AiChatTab';
import { type AiChatSurface } from '@/ai-chat/types/AiChatSurface';

type AiChatSurfaceViewProps = {
  surface: AiChatSurface;
  instanceId: string;
  threadId: string;
  onThreadChange: (threadId: string) => void;
};

export const AiChatSurfaceView = ({
  surface,
  instanceId,
  threadId,
  onThreadChange,
}: AiChatSurfaceViewProps) => (
  <AiChatSurfaceContext.Provider value={surface}>
    <AiChatInstance
      instanceId={instanceId}
      threadId={threadId}
      onThreadChange={onThreadChange}
    >
      <AiChatTab />
    </AiChatInstance>
  </AiChatSurfaceContext.Provider>
);
