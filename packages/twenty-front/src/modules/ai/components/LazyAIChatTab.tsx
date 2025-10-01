import { AIChatSkeletonLoader } from '@/ai/components/internal/AIChatSkeletonLoader';
import { type UIMessageWithMetadata } from '@/ai/types/UIMessageWithMetadata';
import { lazy, Suspense } from 'react';

const AIChatTab = lazy(() =>
  import('./AIChatTab').then((module) => ({
    default: module.AIChatTab,
  })),
);

export const LazyAIChatTab = ({
  agentId,
  uiMessages,
}: {
  agentId: string;
  uiMessages: UIMessageWithMetadata[];
}) => {
  return (
    <Suspense fallback={<AIChatSkeletonLoader />}>
      <AIChatTab agentId={agentId} uiMessages={uiMessages} />
    </Suspense>
  );
};
