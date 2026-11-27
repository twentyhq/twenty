import { GettingStartedOpenedSection } from '@/getting-started/components/GettingStartedOpenedSection';
import { useActiveNavigationMenuTab } from '@/navigation-menu-item/display/hooks/useActiveNavigationMenuTab';
import { NavigationDrawerOpenedSection } from '@/navigation-menu-item/display/sections/components/NavigationDrawerOpenedSection';
import { NavigationDrawerWorkspaceSectionSkeletonLoader } from '@/object-metadata/components/NavigationDrawerWorkspaceSectionSkeletonLoader';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

import { styled } from '@linaria/react';
import { lazy, Suspense } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { themeCssVariables } from 'twenty-ui/theme';

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

const NavigationMenuTabContent = lazy(() =>
  import('@/navigation-menu-item/display/containers/components/NavigationMenuTabContent').then(
    (module) => ({
      default: module.NavigationMenuTabContent,
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

  if (isDefined(activeNavigationMenuTab)) {
    return (
      <StyledScrollableItemsContainer>
        <NavigationDrawerOpenedSection />
        <GettingStartedOpenedSection />
        <Suspense fallback={<NavigationDrawerWorkspaceSectionSkeletonLoader />}>
          <NavigationMenuTabContent
            key={activeNavigationMenuTab.id}
            containerId={activeNavigationMenuTab.id}
          />
        </Suspense>
      </StyledScrollableItemsContainer>
    );
  }

  return (
    <StyledScrollableItemsContainer>
      <NavigationDrawerOpenedSection />
      <GettingStartedOpenedSection />
      <Suspense fallback={<NavigationDrawerWorkspaceSectionSkeletonLoader />}>
        {!isCustomizableSidebarEnabled && <FavoritesSectionDispatcher />}
        {isCustomizableSidebarEnabled ? (
          <NavigationMenuTabContent containerId={null} />
        ) : (
          <WorkspaceSectionDispatcher />
        )}
      </Suspense>
    </StyledScrollableItemsContainer>
  );
};
