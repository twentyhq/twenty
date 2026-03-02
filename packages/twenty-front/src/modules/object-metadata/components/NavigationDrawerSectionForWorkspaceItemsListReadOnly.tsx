import styled from '@emotion/styled';
import type { FlatWorkspaceItem } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import type { WorkspaceSectionListDndKitProps } from '@/object-metadata/components/WorkspaceSectionListDndKitProps';
import { WorkspaceSectionItemContent } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemContent';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.betweenSiblingsGap};
`;

type NavigationDrawerSectionForWorkspaceItemsListReadOnlyProps = Pick<
  WorkspaceSectionListDndKitProps,
  'filteredItems' | 'folderChildrenById' | 'onActiveObjectMetadataItemClick'
>;

const READ_ONLY_EDIT_MODE_PROPS = {
  isSelectedInEditMode: false,
  onEditModeClick: undefined,
} as const;

export const NavigationDrawerSectionForWorkspaceItemsListReadOnly = ({
  filteredItems,
  folderChildrenById,
  onActiveObjectMetadataItemClick,
}: NavigationDrawerSectionForWorkspaceItemsListReadOnlyProps) => {
  const folderCount = filteredItems.filter(
    (item) => item.itemType === NavigationMenuItemType.FOLDER,
  ).length;

  return (
    <StyledList>
      {filteredItems.map((item: FlatWorkspaceItem) => (
        <WorkspaceSectionItemContent
          key={item.id}
          item={item}
          editModeProps={READ_ONLY_EDIT_MODE_PROPS}
          isDragging={false}
          folderChildrenById={folderChildrenById}
          folderCount={folderCount}
          selectedNavigationMenuItemId={null}
          onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
          readOnly
        />
      ))}
    </StyledList>
  );
};
