import { lazy, Suspense, useState, type ReactNode } from 'react';

import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { PageDragDropProviderMountEffect } from '@/navigation-menu-item/display/dnd/providers/PageDragDropProviderMountEffect';

const LazyNavigationMenuItemDndKitProvider = lazy(() =>
  import(
    '@/navigation-menu-item/display/dnd/providers/NavigationMenuItemDndKitProvider'
  ).then((m) => ({
    default: m.NavigationMenuItemDndKitProvider,
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
      <LazyNavigationMenuItemDndKitProvider
        section={NavigationSections.WORKSPACE}
      >
        {children}
      </LazyNavigationMenuItemDndKitProvider>
    </Suspense>
  );
};
