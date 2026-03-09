import { AgentChatDataEffect } from '@/ai/components/AgentChatDataEffect';
import { AgentChatContext } from '@/ai/contexts/AgentChatContext';
import { useAgentChatData } from '@/ai/hooks/useAgentChatData';
import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { Suspense, useState } from 'react';

export const AgentChatProviderContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [focusEditorAfterMigrate, setFocusEditorAfterMigrate] = useState(false);
  const [skipMessagesSkeleton, setSkipMessagesSkeleton] = useState(false);
  const [threadIdCreatedFromDraft, setThreadIdCreatedFromDraft] = useState<
    string | null
  >(null);

  const { ensureThreadForDraft, threadsLoading, messagesLoading } =
    useAgentChatData({
      onMigrateFromDraft: (threadId) => {
        setFocusEditorAfterMigrate(true);
        setSkipMessagesSkeleton(true);
        setThreadIdCreatedFromDraft(threadId);
      },
      setSkipMessagesSkeleton,
    });

  const contextValue = {
    ensureThreadForDraft,
    threadsLoading,
    messagesLoading,
    skipMessagesSkeleton,
    focusEditorAfterMigrate,
    setFocusEditorAfterMigrate,
    threadIdCreatedFromDraft,
    setThreadIdCreatedFromDraft,
  };

  return (
    <Suspense fallback={null}>
      <AgentChatContext.Provider value={contextValue}>
        <AgentChatComponentInstanceContext.Provider
          value={{ instanceId: 'agentChatComponentInstance' }}
        >
          <AgentChatDataEffect />
          {children}
        </AgentChatComponentInstanceContext.Provider>
      </AgentChatContext.Provider>
    </Suspense>
  );
};
