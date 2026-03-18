import type { ReactNode } from 'react';

import type { NavigationMenuItemClickParams } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import type { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

import type { EditModeProps } from '@/object-metadata/components/EditModeProps';

export type NavigationMenuItemSectionContentProps = {
  item: NavigationMenuItem;
  isEditInPlace?: boolean;
  editModeProps?: EditModeProps;
  isDragging: boolean;
  folderChildrenById: Map<string, NavigationMenuItem[]>;
  folderCount: number;
  rightOptions?: ReactNode;
  selectedNavigationMenuItemId?: string | null;
  onNavigationMenuItemClick?: (params: NavigationMenuItemClickParams) => void;
  onActiveObjectMetadataItemClick?: (
    objectMetadataItem: ObjectMetadataItem,
    navigationMenuItemId: string,
  ) => void;
  readOnly?: boolean;
};
