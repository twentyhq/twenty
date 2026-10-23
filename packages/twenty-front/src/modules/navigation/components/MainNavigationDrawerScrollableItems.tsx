import { useActiveNavigationMenuTab } from '@/navigation-menu-item/display/hooks/useActiveNavigationMenuTab';
import { NavigationDrawerOpenedSection } from '@/navigation-menu-item/display/sections/components/NavigationDrawerOpenedSection';
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
          tabId={activeNavigationMenuTab.id}
        />
      ) : (
        <Suspense fallback={<NavigationDrawerWorkspaceSectionSkeletonLoader />}>
          <FavoritesSectionDispatcher />
          <NavigationMenuTabContent tabId={null} />
        </Suspense>
      )}
    </StyledScrollableItemsContainer>
  );
};
