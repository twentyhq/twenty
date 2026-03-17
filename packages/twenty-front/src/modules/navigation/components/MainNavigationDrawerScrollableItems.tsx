import { NavigationDrawerOpenedSection } from '@/navigation-menu-item/display/sections/components/NavigationDrawerOpenedSection';
import { NavigationDrawerWorkspaceSectionSkeletonLoader } from '@/object-metadata/components/NavigationDrawerWorkspaceSectionSkeletonLoader';
import { RemoteNavigationDrawerSection } from '@/object-metadata/components/RemoteNavigationDrawerSection';

import { NavigationDrawerOtherSection } from '@/navigation/components/NavigationDrawerOtherSection';
import { styled } from '@linaria/react';
import { lazy, Suspense } from 'react';

import { themeCssVariables } from 'twenty-ui/theme-constants';

const FavoritesSectionDispatcher = lazy(() =>
  import(
    '@/navigation-menu-item/display/sections/favorites/components/FavoritesSectionDispatcher'
  ).then((module) => ({
    default: module.FavoritesSectionDispatcher,
  })),
);

const WorkspaceNavigationMenuItemsDispatcher = lazy(() =>
  import(
    '@/navigation-menu-item/display/sections/workspace/components/WorkspaceNavigationMenuItemsDispatcher'
  ).then((module) => ({
    default: module.WorkspaceNavigationMenuItemsDispatcher,
  })),
);

const StyledScrollableItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

export const MainNavigationDrawerScrollableItems = () => {
  return (
    <StyledScrollableItemsContainer>
      <NavigationDrawerOpenedSection />
      <Suspense fallback={<NavigationDrawerWorkspaceSectionSkeletonLoader />}>
        <FavoritesSectionDispatcher />
        <WorkspaceNavigationMenuItemsDispatcher />
      </Suspense>
      <RemoteNavigationDrawerSection />
      <NavigationDrawerOtherSection />
    </StyledScrollableItemsContainer>
  );
};
