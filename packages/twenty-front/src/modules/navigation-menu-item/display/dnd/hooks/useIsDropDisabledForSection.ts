import { ADD_TO_NAV_SOURCE_DROPPABLE_ID } from '@/navigation-menu-item/common/constants/AddToNavSourceDroppableId';
import { NavigationDragSourceContext } from '@/navigation-menu-item/common/contexts/NavigationDragSourceContext';
import { isWorkspaceDroppableId } from '@/navigation-menu-item/common/utils/isWorkspaceDroppableId';
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
  return isWorkspaceDroppableId(sourceDroppableId) !== isWorkspaceSection;
};
