import { AIChatSkeletonLoader } from '@/ai/components/internal/AIChatSkeletonLoader';
import { type UIMessageWithMetadata } from '@/ai/types/UIMessageWithMetadata';
import { lazy, Suspense } from 'react';

const AgentChatSessionProvider = lazy(() =>
  import('./AgentChatSessionProvider').then((module) => ({
    default: module.AgentChatSessionProvider,
  })),
);

export const LazyAgentChatSessionProvider = ({
  agentId,
  uiMessages,
  isLoading,
  children,
}: {
  agentId: string;
  uiMessages: UIMessageWithMetadata[];
  isLoading: boolean;
  children: React.ReactNode;
}) => {
  return (
    <Suspense fallback={<AIChatSkeletonLoader />}>
      <AgentChatSessionProvider
        agentId={agentId}
        uiMessages={uiMessages}
        isLoading={isLoading}
      >
        {children}
      </AgentChatSessionProvider>
    </Suspense>
  );
};
