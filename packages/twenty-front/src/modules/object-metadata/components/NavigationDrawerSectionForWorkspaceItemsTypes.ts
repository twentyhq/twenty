import type {
  FlatWorkspaceItem,
  NavigationMenuItemClickParams,
} from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import type { ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import type { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import type { View } from '@/views/types/View';

export type EditModeProps = {
  isSelectedInEditMode: boolean;
  onEditModeClick?: () => void;
};

export type WorkspaceSectionItemContentProps = {
  item: FlatWorkspaceItem;
  editModeProps: EditModeProps;
  useDndKit: boolean;
  isEditMode: boolean;
  isDragging: boolean;
  folderChildrenById: Map<string, ProcessedNavigationMenuItem[]>;
  folderCount: number;
  selectedNavigationMenuItemId: string | null;
  onNavigationMenuItemClick?: (params: NavigationMenuItemClickParams) => void;
  onActiveObjectMetadataItemClick?: (
    objectMetadataItem: ObjectMetadataItem,
    navigationMenuItemId: string,
  ) => void;
  objectMetadataItems: ObjectMetadataItem[];
  views: View[];
};

export type WorkspaceSectionListCommonProps = {
  filteredItems: FlatWorkspaceItem[];
  getEditModeProps: (item: FlatWorkspaceItem) => EditModeProps;
  folderChildrenById: Map<string, ProcessedNavigationMenuItem[]>;
  folderCount: number;
  workspaceDropDisabled: boolean;
  isEditMode: boolean;
  isDragging: boolean;
  selectedNavigationMenuItemId: string | null;
  onNavigationMenuItemClick?: (params: NavigationMenuItemClickParams) => void;
  onActiveObjectMetadataItemClick?: (
    objectMetadataItem: ObjectMetadataItem,
    navigationMenuItemId: string,
  ) => void;
  objectMetadataItems: ObjectMetadataItem[];
  views: View[];
  isAddMenuItemButtonVisible: boolean;
  addToNavigationFallbackDestination: {
    droppableId: string;
    index: number;
  } | null;
  onAddMenuItem?: () => void;
  addMenuItemLabel: string;
};

export type WorkspaceSectionListDndKitProps = WorkspaceSectionListCommonProps;
export type WorkspaceSectionListHelloPangeaProps =
  WorkspaceSectionListCommonProps;
