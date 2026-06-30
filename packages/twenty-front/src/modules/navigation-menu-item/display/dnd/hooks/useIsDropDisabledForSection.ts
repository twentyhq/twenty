import { ADD_TO_NAV_SOURCE_DROPPABLE_ID } from '@/navigation-menu-item/common/constants/AddToNavSourceDroppableId';
import { NavigationDragSourceContext } from '@/navigation-menu-item/common/contexts/NavigationDragSourceContext';
import { canNavigationMenuItemBeDroppedIn } from '@/navigation-menu-item/common/utils/canNavigationMenuItemBeDroppedIn';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useIsDropDisabledForSection = (isWorkspaceSection: boolean) => {
  const { sourceDroppableId } = useContext(NavigationDragSourceContext);
  if (!isDefined(sourceDroppableId)) {
    return false;
  }
  if (sourceDroppableId === ADD_TO_NAV_SOURCE_DROPPABLE_ID) {
    return !isWorkspaceSection;
  }
  const sourceIsWorkspace = canNavigationMenuItemBeDroppedIn({
    navigationMenuItemSection: 'workspace',
    droppableId: sourceDroppableId,
  });
  return sourceIsWorkspace !== isWorkspaceSection;
};
