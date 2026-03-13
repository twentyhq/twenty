import { styled } from '@linaria/react';

import { NavigationDrawerSectionForWorkspaceItemsListReadOnly } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemsListReadOnly';
import { WorkspaceSectionAddMenuItemButton } from '@/object-metadata/components/WorkspaceSectionAddMenuItemButton';
import type { WorkspaceSectionListDndKitProps } from '@/object-metadata/components/WorkspaceSectionListDndKitProps';
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
