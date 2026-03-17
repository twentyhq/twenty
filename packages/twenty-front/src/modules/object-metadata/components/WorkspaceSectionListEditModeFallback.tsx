import { styled } from '@linaria/react';

import { NavigationDrawerSectionForWorkspaceItemsListReadOnly } from '@/navigation-menu-item/display/sections/components/NavigationDrawerSectionForWorkspaceItemsListReadOnly';
import { WorkspaceSectionAddMenuItemButton } from '@/navigation-menu-item/edit/components/WorkspaceSectionAddMenuItemButton';
import type { WorkspaceSectionListDndKitProps } from '@/navigation-menu-item/display/sections/types/WorkspaceSectionListDndKitProps';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledFallback = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

type WorkspaceSectionListEditModeFallbackProps = Pick<
  WorkspaceSectionListDndKitProps,
  'filteredItems' | 'folderChildrenById' | 'onActiveObjectMetadataItemClick'
>;

export const WorkspaceSectionListEditModeFallback = ({
  filteredItems,
  folderChildrenById,
  onActiveObjectMetadataItemClick,
}: WorkspaceSectionListEditModeFallbackProps) => (
  <StyledFallback>
    <NavigationDrawerSectionForWorkspaceItemsListReadOnly
      filteredItems={filteredItems}
      folderChildrenById={folderChildrenById}
      onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
    />
    <WorkspaceSectionAddMenuItemButton />
  </StyledFallback>
);
