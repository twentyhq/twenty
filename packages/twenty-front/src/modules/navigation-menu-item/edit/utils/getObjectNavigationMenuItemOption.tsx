import { NavigationMenuItemType } from 'twenty-shared/types';

import { type NewNavigationMenuItemInput } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/types/NavigationMenuItemOption';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';

type GetObjectNavigationMenuItemOptionArgs = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  isAlreadyInSidebar: boolean;
  addItem: (input: NewNavigationMenuItemInput) => void;
};

export const getObjectNavigationMenuItemOption = ({
  objectMetadataItem,
  isAlreadyInSidebar,
  addItem,
}: GetObjectNavigationMenuItemOptionArgs): NavigationMenuItemOption => ({
  id: objectMetadataItem.id,
  label: objectMetadataItem.labelPlural,
  searchableValues: [
    objectMetadataItem.labelPlural,
    objectMetadataItem.labelSingular,
    objectMetadataItem.namePlural,
    objectMetadataItem.nameSingular,
  ],
  icon: <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />,
  isAlreadyInSidebar,
  isDisabled: isAlreadyInSidebar,
  onClick: () =>
    addItem({
      type: NavigationMenuItemType.OBJECT,
      targetObjectMetadataId: objectMetadataItem.id,
      color: getObjectColorWithFallback(objectMetadataItem),
    }),
});
