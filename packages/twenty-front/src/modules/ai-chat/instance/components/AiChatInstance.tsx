import { type ReactNode, useMemo } from 'react';

import { AiChatInstanceContext } from '@/ai-chat/contexts/AiChatInstanceContext';
import { AiChatInstanceEffects } from '@/ai-chat/instance/components/AiChatInstanceEffects';

type AiChatInstanceProps = {
  instanceId: string;
  threadId: string;
  onThreadChange: (threadId: string) => void;
  children: ReactNode;
};

export const AiChatInstance = ({
  instanceId,
  threadId,
  onThreadChange,
  children,
}: AiChatInstanceProps) => {
  const aiChatInstance = useMemo(
    () => ({ instanceId, threadId, onThreadChange }),
    [instanceId, threadId, onThreadChange],
  );

  return (
    <AiChatInstanceContext.Provider value={aiChatInstance}>
      <AiChatInstanceEffects />
      {children}
    </AiChatInstanceContext.Provider>
  );
};
