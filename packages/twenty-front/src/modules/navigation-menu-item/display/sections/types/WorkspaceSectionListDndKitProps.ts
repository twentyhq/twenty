import type { NavigationMenuItemClickParams } from '@/navigation-menu-item/display/hooks/useWorkspaceSectionItems';
import type { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

import type { EditModeProps } from '@/object-metadata/components/EditModeProps';

export type WorkspaceSectionListDndKitProps = {
  filteredItems: NavigationMenuItem[];
  getEditModeProps: (item: NavigationMenuItem) => EditModeProps;
  folderChildrenById: Map<string, NavigationMenuItem[]>;
  selectedNavigationMenuItemId: string | null;
  onNavigationMenuItemClick?: (params: NavigationMenuItemClickParams) => void;
  onActiveObjectMetadataItemClick?: (
    objectMetadataItem: ObjectMetadataItem,
    navigationMenuItemId: string,
  ) => void;
};
