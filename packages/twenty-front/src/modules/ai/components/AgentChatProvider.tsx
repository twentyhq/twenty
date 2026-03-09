import { AgentChatDataEffect } from '@/ai/components/AgentChatDataEffect';
import { AgentChatContext } from '@/ai/contexts/AgentChatContext';
import { useAgentChatData } from '@/ai/hooks/useAgentChatData';
import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Suspense, useState } from 'react';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const AgentChatProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);
  const [focusEditorAfterMigrate, setFocusEditorAfterMigrate] =
    useState(false);
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

  if (!isAiEnabled) {
    return <>{children}</>;
  }

  const contextValue = {
    ensureThreadForDraft,
    threadsLoading,
    messagesLoading,
    skipMessagesSkeleton,
    focusEditorAfterMigrate,
    setFocusEditorAfterMigrate,
    threadIdCreatedFromDraft,
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
