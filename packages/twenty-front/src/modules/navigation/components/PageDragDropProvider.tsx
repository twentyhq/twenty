import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

import { FavoritesDragDropProviderContent } from '@/navigation/components/FavoritesDragDropProviderContent';
import { preloadWorkspaceDndKit } from '@/navigation/preloadWorkspaceDndKit';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

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
  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );

  useEffect(() => {
    preloadWorkspaceDndKit();
  }, []);

  if (isNavigationMenuItemEditingEnabled) {
    return (
      <Suspense fallback={null}>
        <LazyWorkspaceDndKitProvider>{children}</LazyWorkspaceDndKitProvider>
      </Suspense>
    );
  }

  return (
    <FavoritesDragDropProviderContent>
      {children}
    </FavoritesDragDropProviderContent>
  );
};
