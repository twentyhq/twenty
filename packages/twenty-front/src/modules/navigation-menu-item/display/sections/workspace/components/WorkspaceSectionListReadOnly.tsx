import { styled } from '@linaria/react';
import { Fragment } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import type { NavigationMenuItem } from '~/generated-metadata/graphql';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import type { NavigationMenuItemSectionListDndKitProps } from '@/navigation-menu-item/display/sections/types/NavigationMenuItemSectionListDndKitProps';
import { NavigationMenuItemDisplay } from '@/navigation-menu-item/display/components/NavigationMenuItemDisplay';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.betweenSiblingsGap};
  padding-top: ${themeCssVariables.betweenSiblingsGap};
`;

type WorkspaceSectionListReadOnlyProps = Pick<
  NavigationMenuItemSectionListDndKitProps,
  | 'filteredItems'
  | 'folderChildrenById'
  | 'onActiveObjectMetadataItemClick'
  | 'renderSection'
>;

const READ_ONLY_EDIT_MODE_PROPS = {
  isSelectedInEditMode: false,
  onEditModeClick: undefined,
} as const;

export const WorkspaceSectionListReadOnly = ({
  filteredItems,
  folderChildrenById,
  onActiveObjectMetadataItemClick,
  renderSection,
}: WorkspaceSectionListReadOnlyProps) => {
  const folderCount = filteredItems.filter(
    (item) => item.type === NavigationMenuItemType.FOLDER,
  ).length;

  const renderListEntry = (item: NavigationMenuItem) => {
    if (
      item.type === NavigationMenuItemType.SECTION &&
      isDefined(renderSection)
    ) {
      return <Fragment key={item.id}>{renderSection(item)}</Fragment>;
    }

    return (
      <NavigationMenuItemDisplay
        key={item.id}
        item={item}
        editModeProps={READ_ONLY_EDIT_MODE_PROPS}
        isDragging={false}
        folderChildrenById={folderChildrenById}
        folderCount={folderCount}
        onActiveObjectMetadataItemClick={onActiveObjectMetadataItemClick}
        readOnly
      />
    );
  };

  return <StyledList>{filteredItems.map(renderListEntry)}</StyledList>;
};
