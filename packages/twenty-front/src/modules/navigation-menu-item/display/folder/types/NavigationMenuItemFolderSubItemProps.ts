import { type ReactNode } from 'react';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export type NavigationMenuItemFolderSubItemProps = {
  navigationMenuItem: NavigationMenuItem;
  label?: string;
  index: number;
  arrayLength: number;
  selectedIndex: number;
  isDragging: boolean;
  rightOptions?: ReactNode;
  onClick?: () => void;
  onNavigationMenuItemClick?: (params: {
    item: NavigationMenuItem;
    objectMetadataItem?: EnrichedObjectMetadataItem;
  }) => void;
};
