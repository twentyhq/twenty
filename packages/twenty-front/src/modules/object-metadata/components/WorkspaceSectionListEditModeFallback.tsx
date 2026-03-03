import styled from '@emotion/styled';

import type { WorkspaceSectionListDndKitProps } from '@/object-metadata/components/WorkspaceSectionListDndKitProps';
import { NavigationDrawerSectionForWorkspaceItemsListReadOnly } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemsListReadOnly';
import { WorkspaceSectionAddMenuItemButton } from '@/object-metadata/components/WorkspaceSectionAddMenuItemButton';

const StyledFallback = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.betweenSiblingsGap};
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
