import styled from '@emotion/styled';

import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/constants/NavigationMenuItemDroppableIds';

export const WORKSPACE_ORPHAN_DROPPABLE_ID =
  NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS;

export const StyledWorkspaceDroppableList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.betweenSiblingsGap};
`;
