import { lazy, Suspense, type ReactNode } from 'react';

import { preloadWorkspaceDndKit } from '@/navigation/preloadWorkspaceDndKit';

const LazyWorkspaceDndKitProvider = lazy(() =>
  import('@/navigation/components/WorkspaceDndKitProvider').then((m) => ({
    default: m.WorkspaceDndKitProvider,
  })),
);

preloadWorkspaceDndKit();

type PageDragDropProviderProps = {
  children: ReactNode;
};

export const PageDragDropProvider = ({
  children,
}: PageDragDropProviderProps) => {
  return (
    <Suspense fallback={null}>
      <LazyWorkspaceDndKitProvider>{children}</LazyWorkspaceDndKitProvider>
    </Suspense>
  );
};
