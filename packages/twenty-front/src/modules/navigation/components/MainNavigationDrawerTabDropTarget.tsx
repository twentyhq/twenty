import { lazy, type ReactNode, Suspense } from 'react';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const LazyNavigationMenuTabDropTarget = lazy(() =>
  import('@/navigation-menu-item/display/dnd/components/NavigationMenuTabDropTarget').then(
    (module) => ({ default: module.NavigationMenuTabDropTarget }),
  ),
);

type MainNavigationDrawerTabDropTargetProps = {
  tabId: string | null;
  children: ReactNode;
};

export const MainNavigationDrawerTabDropTarget = ({
  tabId,
  children,
}: MainNavigationDrawerTabDropTargetProps) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );

  if (!isCustomizableSidebarEnabled || !isLayoutCustomizationModeEnabled) {
    return children;
  }

  return (
    <Suspense fallback={children}>
      <LazyNavigationMenuTabDropTarget tabId={tabId}>
        {children}
      </LazyNavigationMenuTabDropTarget>
    </Suspense>
  );
};
