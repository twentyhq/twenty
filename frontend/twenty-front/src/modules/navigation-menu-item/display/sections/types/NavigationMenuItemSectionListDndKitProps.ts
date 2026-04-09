import type { NavigationMenuItemClickParams } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import type { EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

import type { EditModeProps } from '@/object-metadata/components/EditModeProps';

export type NavigationMenuItemSectionListDndKitProps = {
  filteredItems: NavigationMenuItem[];
  getEditModeProps: (item: NavigationMenuItem) => EditModeProps;
  folderChildrenById: Map<string, NavigationMenuItem[]>;
  onNavigationMenuItemClick?: (params: NavigationMenuItemClickParams) => void;
  onActiveObjectMetadataItemClick?: (
    objectMetadataItem: EnrichedObjectMetadataItem,
    navigationMenuItemId: string,
  ) => void;
};
