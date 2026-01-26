import { NavigationDrawerOpenedSection } from '@/object-metadata/components/NavigationDrawerOpenedSection';
import { RemoteNavigationDrawerSection } from '@/object-metadata/components/RemoteNavigationDrawerSection';
import styled from '@emotion/styled';
import { lazy, Suspense } from 'react';

const CurrentWorkspaceMemberNavigationMenuItemFoldersDispatcher = lazy(() =>
  import(
    '@/navigation-menu-item/components/CurrentWorkspaceMemberNavigationMenuItemFoldersDispatcher'
  ).then((module) => ({
    default: module.CurrentWorkspaceMemberNavigationMenuItemFoldersDispatcher,
  })),
);

const WorkspaceNavigationMenuItemsDispatcher = lazy(() =>
  import(
    '@/navigation-menu-item/components/WorkspaceNavigationMenuItemsDispatcher'
  ).then((module) => ({
    default: module.WorkspaceNavigationMenuItemsDispatcher,
  })),
);

const StyledScrollableItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const MainNavigationDrawerScrollableItems = () => {
  return (
    <StyledScrollableItemsContainer>
      <NavigationDrawerOpenedSection />
      <Suspense fallback={null}>
        <CurrentWorkspaceMemberNavigationMenuItemFoldersDispatcher />
      </Suspense>
      <Suspense fallback={null}>
        <WorkspaceNavigationMenuItemsDispatcher />
      </Suspense>
      <RemoteNavigationDrawerSection />
    </StyledScrollableItemsContainer>
  );
};
