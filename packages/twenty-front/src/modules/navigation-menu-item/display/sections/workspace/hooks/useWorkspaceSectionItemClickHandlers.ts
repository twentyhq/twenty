import { isNonEmptyString } from '@sniptt/guards';
import { useNavigate } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { type NavigationMenuItemClickParams } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

export const useWorkspaceSectionItemClickHandlers = () => {
  const navigate = useNavigate();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const lastVisitedViewPerObjectMetadataItem = useAtomStateValue(
    lastVisitedViewPerObjectMetadataItemState,
  );
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const [
    selectedNavigationMenuItemIdInEditMode,
    setSelectedNavigationMenuItemIdInEditMode,
  ] = useAtomState(selectedNavigationMenuItemIdInEditModeState);

  const handleNavigationMenuItemClick = ({
    item,
  }: NavigationMenuItemClickParams) => {
    setSelectedNavigationMenuItemIdInEditMode(item.id);
    if (
      item.type === NavigationMenuItemType.FOLDER ||
      item.type === NavigationMenuItemType.LINK
    ) {
      return;
    }
    const link = getNavigationMenuItemComputedLink({
      item,
      objectMetadataItems,
      views,
      lastVisitedViewPerObjectMetadataItem,
    });
    if (isNonEmptyString(link)) {
      navigate(link);
    }
  };

  const handleActiveObjectMetadataItemClick = (
    _objectMetadataItem: EnrichedObjectMetadataItem,
    navigationMenuItemId: string,
  ) => {
    if (enterLayoutCustomizationMode()) {
      setSelectedNavigationMenuItemIdInEditMode(navigationMenuItemId);
    }
  };

  return {
    selectedNavigationMenuItemId: selectedNavigationMenuItemIdInEditMode,
    onNavigationMenuItemClick: isLayoutCustomizationModeEnabled
      ? handleNavigationMenuItemClick
      : undefined,
    onActiveObjectMetadataItemClick: handleActiveObjectMetadataItemClick,
  };
};
