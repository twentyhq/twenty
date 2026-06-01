import { NavigationDrawerOpenedSection } from '@/navigation-menu-item/display/sections/components/NavigationDrawerOpenedSection';
import { NavigationDrawerWorkspaceSectionSkeletonLoader } from '@/object-metadata/components/NavigationDrawerWorkspaceSectionSkeletonLoader';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NavigationDrawerOtherSection } from '@/navigation/components/NavigationDrawerOtherSection';
import { ShahryarNavigationSection } from '@/shahryar/navigation/components/ShahryarNavigationSection';
import { ShahryarOtherSection } from '@/shahryar/navigation/components/ShahryarOtherSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { lazy, Suspense } from 'react';

import { REACT_APP_SHAHRYAR_MODE } from '~/config';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  if (REACT_APP_SHAHRYAR_MODE) {
    return (
      <StyledScrollableItemsContainer>
        <ShahryarNavigationSection />
        <ShahryarOtherSection />
      </StyledScrollableItemsContainer>
    );
  }

  return (
    <StyledScrollableItemsContainer>
      <NavigationDrawerOpenedSection />
      <Suspense fallback={<NavigationDrawerWorkspaceSectionSkeletonLoader />}>
        <FavoritesSectionDispatcher />
        <WorkspaceSectionDispatcher />
      </Suspense>
      {!isLayoutCustomizationModeEnabled && <NavigationDrawerOtherSection />}
    </StyledScrollableItemsContainer>
  );
};
