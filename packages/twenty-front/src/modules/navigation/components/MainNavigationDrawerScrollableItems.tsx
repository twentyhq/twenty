import { CurrentWorkspaceMemberNavigationMenuItemFoldersDispatcher } from '@/navigation-menu-item/components/CurrentWorkspaceMemberNavigationMenuItemFoldersDispatcher';
import { WorkspaceNavigationMenuItemsDispatcher } from '@/navigation-menu-item/components/WorkspaceNavigationMenuItemsDispatcher';
import { NavigationDrawerOpenedSection } from '@/object-metadata/components/NavigationDrawerOpenedSection';
import { RemoteNavigationDrawerSection } from '@/object-metadata/components/RemoteNavigationDrawerSection';
import styled from '@emotion/styled';

const StyledScrollableItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const MainNavigationDrawerScrollableItems = () => {
  return (
    <StyledScrollableItemsContainer>
      <NavigationDrawerOpenedSection />
      <CurrentWorkspaceMemberNavigationMenuItemFoldersDispatcher />
      <WorkspaceNavigationMenuItemsDispatcher />
      <RemoteNavigationDrawerSection />
    </StyledScrollableItemsContainer>
  );
};
