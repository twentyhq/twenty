import { useActiveNavigationMenuTab } from '@/navigation-menu-item/display/hooks/useActiveNavigationMenuTab';
import { NavigationDrawerOpenedSection } from '@/navigation-menu-item/display/sections/components/NavigationDrawerOpenedSection';
import { NavigationMenuItemCustomSections } from '@/navigation-menu-item/display/sections/custom/components/NavigationMenuItemCustomSections';
import { NavigationMenuTabContent } from '@/navigation-menu-item/display/tab/components/NavigationMenuTabContent';
import { NavigationDrawerWorkspaceSectionSkeletonLoader } from '@/object-metadata/components/NavigationDrawerWorkspaceSectionSkeletonLoader';

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

const StyledScrollableItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

export const MainNavigationDrawerScrollableItems = () => {
  const activeNavigationMenuTab = useActiveNavigationMenuTab();

  return (
    <StyledScrollableItemsContainer>
      <NavigationDrawerOpenedSection />
      {isDefined(activeNavigationMenuTab) ? (
        <NavigationMenuTabContent
          key={activeNavigationMenuTab.id}
          tab={activeNavigationMenuTab}
        />
      ) : (
        <Suspense fallback={<NavigationDrawerWorkspaceSectionSkeletonLoader />}>
          <FavoritesSectionDispatcher />
          <NavigationMenuItemCustomSections
            parentId={null}
            placement="above-items"
          />
          <WorkspaceSectionDispatcher />
          <NavigationMenuItemCustomSections
            parentId={null}
            placement="below-items"
          />
        </Suspense>
      )}
    </StyledScrollableItemsContainer>
  );
};
