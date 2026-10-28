import { NavigationMenuItemCommands } from '@/navigation-menu-item/display/command/components/NavigationMenuItemCommands';
import { useActiveNavigationMenuTab } from '@/navigation-menu-item/display/hooks/useActiveNavigationMenuTab';
import { NavigationDrawerOpenedSection } from '@/navigation-menu-item/display/sections/components/NavigationDrawerOpenedSection';
import { NavigationMenuTabContent } from '@/navigation-menu-item/display/tab/components/NavigationMenuTabContent';
import { NavigationDrawerWorkspaceSectionSkeletonLoader } from '@/object-metadata/components/NavigationDrawerWorkspaceSectionSkeletonLoader';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

import { styled } from '@linaria/react';
import { lazy, Suspense } from 'react';

import { themeCssVariables } from 'twenty-ui/theme';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const FavoritesSectionDispatcher = lazy(() =>
  import('@/navigation-menu-item/display/sections/favorites/components/FavoritesSectionDispatcher').then(
    (module) => ({
      default: module.FavoritesSectionDispatcher,
    }),
  ),
);

const WorkspaceSectionDispatcher = lazy(() =>
  import('@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionDispatcher').then(
    (module) => ({
      default: module.WorkspaceSectionDispatcher,
    }),
  ),
);

const StyledScrollableItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

export const MainNavigationDrawerScrollableItems = () => {
  const activeNavigationMenuTab = useActiveNavigationMenuTab();
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );

  if (!isCustomizableSidebarEnabled) {
    return (
      <StyledScrollableItemsContainer>
        <NavigationDrawerOpenedSection />
        <Suspense fallback={<NavigationDrawerWorkspaceSectionSkeletonLoader />}>
          <FavoritesSectionDispatcher />
          <WorkspaceSectionDispatcher />
        </Suspense>
      </StyledScrollableItemsContainer>
    );
  }

  return (
    <StyledScrollableItemsContainer>
      <NavigationMenuItemCommands />
      <NavigationDrawerOpenedSection />
      <NavigationMenuTabContent
        key={activeNavigationMenuTab?.id}
        tabId={activeNavigationMenuTab?.id ?? null}
      />
    </StyledScrollableItemsContainer>
  );
};
