import type {
  FlatWorkspaceItem,
  NavigationMenuItemClickParams,
} from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import type { ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import type { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

import type { EditModeProps } from '@/object-metadata/components/EditModeProps';

export type WorkspaceSectionListDndKitProps = {
  filteredItems: FlatWorkspaceItem[];
  getEditModeProps: (item: FlatWorkspaceItem) => EditModeProps;
  folderChildrenById: Map<string, ProcessedNavigationMenuItem[]>;
  selectedNavigationMenuItemId: string | null;
  onNavigationMenuItemClick?: (params: NavigationMenuItemClickParams) => void;
  onActiveObjectMetadataItemClick?: (
    objectMetadataItem: ObjectMetadataItem,
    navigationMenuItemId: string,
  ) => void;
};
