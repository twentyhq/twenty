import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { NavigationMenuItemDisplay } from '@/navigation-menu-item/display/components/NavigationMenuItemDisplay';
import type { NavigationMenuItemSectionListDndKitProps } from '@/navigation-menu-item/display/sections/types/NavigationMenuItemSectionListDndKitProps';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.betweenSiblingsGap};
  padding-top: ${themeCssVariables.betweenSiblingsGap};
`;

type WorkspaceSectionListReadOnlyProps = Pick<
  NavigationMenuItemSectionListDndKitProps,
  'filteredItems' | 'folderChildrenById' | 'onActiveObjectMetadataItemClick'
> & {
  visibleItemLimit?: number;
};

const READ_ONLY_EDIT_MODE_PROPS = {
  isSelectedInEditMode: false,
  onEditModeClick: undefined,
} as const;

export const WorkspaceSectionListReadOnly = ({
  filteredItems,
  folderChildrenById,
  onActiveObjectMetadataItemClick,
  visibleItemLimit,
}: WorkspaceSectionListReadOnlyProps) => {
  const { t } = useLingui();
  const [isShowingAllItems, setIsShowingAllItems] = useState(false);

  const folderCount = filteredItems.filter(
    (item) => item.type === NavigationMenuItemType.FOLDER,
  ).length;

  const hasHiddenItems =
    isDefined(visibleItemLimit) && filteredItems.length > visibleItemLimit;

  const displayedItems =
    hasHiddenItems && !isShowingAllItems
      ? filteredItems.slice(0, visibleItemLimit)
      : filteredItems;

  return (
    <StyledList>
      {displayedItems.map((item: NavigationMenuItem) => (
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
      ))}
      {hasHiddenItems && (
        <NavigationDrawerItem
          label={isShowingAllItems ? t`See less` : t`See more`}
          Icon={isShowingAllItems ? IconChevronUp : IconChevronDown}
          variant="tertiary"
          preventCollapseOnMobile
          onClick={() => setIsShowingAllItems(!isShowingAllItems)}
        />
      )}
    </StyledList>
  );
};
