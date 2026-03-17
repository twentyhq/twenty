import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import type { NavigationMenuItem } from '~/generated-metadata/graphql';
import { NavigationMenuItemType } from 'twenty-shared/types';
import type { WorkspaceSectionListDndKitProps } from '@/object-metadata/components/WorkspaceSectionListDndKitProps';
import { NavigationDrawerSectionForWorkspaceItemContent } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItemContent';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.betweenSiblingsGap};
  padding-top: ${themeCssVariables.betweenSiblingsGap};
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
    (item) => item.type === NavigationMenuItemType.FOLDER,
  ).length;

  return (
    <StyledList>
      {filteredItems.map((item: NavigationMenuItem) => (
        <NavigationDrawerSectionForWorkspaceItemContent
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
