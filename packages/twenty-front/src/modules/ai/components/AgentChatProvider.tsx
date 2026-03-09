import { AgentChatDataEffect } from '@/ai/components/AgentChatDataEffect';
import { AgentChatContext } from '@/ai/contexts/AgentChatContext';
import { useAgentChatData } from '@/ai/hooks/useAgentChatData';
import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { skipMessagesSkeletonUntilLoadedState } from '@/ai/states/skipMessagesSkeletonUntilLoadedState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useAtomValue } from 'jotai';
import { Suspense } from 'react';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const AgentChatProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);
  const { ensureThreadForDraft, threadsLoading, messagesLoading } =
    useAgentChatData();
  const skipMessagesSkeleton = useAtomValue(
    skipMessagesSkeletonUntilLoadedState,
  );

  if (!isAiEnabled) {
    return <>{children}</>;
  }

  const contextValue = {
    ensureThreadForDraft,
    threadsLoading,
    messagesLoading,
    skipMessagesSkeleton,
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
