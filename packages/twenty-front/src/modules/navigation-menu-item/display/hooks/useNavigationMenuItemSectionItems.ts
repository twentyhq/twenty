import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { useNavigationMenuItemsInContainers } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsInContainers';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export type NavigationMenuItemClickParams = {
  item: NavigationMenuItem;
  objectMetadataItem?: EnrichedObjectMetadataItem | null;
};

export const useNavigationMenuItemSectionItems = (
  containerId: string | null = null,
): NavigationMenuItem[] => useNavigationMenuItemsInContainers([containerId]);
