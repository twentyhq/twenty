import { lazy, Suspense, useState, type ReactNode } from 'react';

import { PageDragDropProviderMountEffect } from '@/navigation/components/PageDragDropProviderMountEffect';

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
  const [hasProviderMounted, setHasProviderMounted] = useState(false);

  if (!hasProviderMounted) {
    return (
      <>
        <PageDragDropProviderMountEffect
          onEnterEditMode={() => setHasProviderMounted(true)}
        />
        {children}
      </>
    );
  }

  return (
    <Suspense fallback={<>{children}</>}>
      <LazyWorkspaceDndKitProvider>{children}</LazyWorkspaceDndKitProvider>
    </Suspense>
  );
};
