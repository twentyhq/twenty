import { lazy, Suspense, type ReactNode } from 'react';

import { WorkspaceDndKitPreloadEffect } from '@/navigation/components/WorkspaceDndKitPreloadEffect';

const LazyWorkspaceDndKitProvider = lazy(() =>
  import('@/navigation/components/WorkspaceDndKitProvider').then((m) => ({
    default: m.WorkspaceDndKitProvider,
  })),
);

type PageDragDropProviderProps = {
  children: ReactNode;
};

export const PageDragDropProvider = ({
  children,
}: PageDragDropProviderProps) => {
  return (
    <>
      <WorkspaceDndKitPreloadEffect />
      <Suspense fallback={null}>
        <LazyWorkspaceDndKitProvider>{children}</LazyWorkspaceDndKitProvider>
      </Suspense>
    </>
  );
};
