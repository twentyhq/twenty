import { AIChatSkeletonLoader } from '@/ai/components/internal/AIChatSkeletonLoader';
import { lazy, Suspense } from 'react';

const AIChatTab = lazy(() =>
  import('./AIChatTab').then((module) => ({
    default: module.AIChatTab,
  })),
);

export const LazyAIChatTab = ({ agentId }: { agentId: string }) => {
  return (
    <Suspense fallback={<AIChatSkeletonLoader />}>
      <AIChatTab agentId={agentId} />
    </Suspense>
  );
};
