import { type ReactNode, useMemo } from 'react';

import { AiChatInstanceContext } from '@/ai-chat/contexts/AiChatInstanceContext';
import { AiChatInstanceEffect } from '@/ai-chat/instance/components/AiChatInstanceEffect';
import { useIsWorkspaceSetupChat } from '@/ai-chat/hooks/useIsWorkspaceSetupChat';
import { WorkspaceSetupChatKickoffEffect } from '@/onboarding/effect-components/WorkspaceSetupChatKickoffEffect';

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
  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();
  const aiChatInstance = useMemo(
    () => ({ instanceId, threadId, onThreadChange }),
    [instanceId, threadId, onThreadChange],
  );

  return (
    <AiChatInstanceContext.Provider value={aiChatInstance}>
      <AiChatInstanceEffect />
      {isWorkspaceSetupChat && <WorkspaceSetupChatKickoffEffect />}
      {children}
    </AiChatInstanceContext.Provider>
  );
};
