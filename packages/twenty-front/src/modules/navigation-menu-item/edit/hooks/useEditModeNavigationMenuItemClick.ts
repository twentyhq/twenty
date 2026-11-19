import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { type NavigationMenuItemClickParams } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

export const useEditModeNavigationMenuItemClick = () => {
  const navigate = useNavigate();
  const store = useStore();
  const setSelectedNavigationMenuItemIdInEditMode = useSetAtomState(
    selectedNavigationMenuItemIdInEditModeState,
  );

  return ({ item }: NavigationMenuItemClickParams) => {
    setSelectedNavigationMenuItemIdInEditMode(item.id);

    if (
      item.type === NavigationMenuItemType.FOLDER ||
      item.type === NavigationMenuItemType.LINK
    ) {
      return;
    }

    const link = getNavigationMenuItemComputedLink({
      item,
      objectMetadataItems: store.get(objectMetadataItemsSelector.atom),
      views: store.get(viewsSelector.atom),
      lastVisitedViewPerObjectMetadataItem: store.get(
        lastVisitedViewPerObjectMetadataItemState.atom,
      ),
    });

    if (isNonEmptyString(link)) {
      navigate(link);
    }
  };
};
