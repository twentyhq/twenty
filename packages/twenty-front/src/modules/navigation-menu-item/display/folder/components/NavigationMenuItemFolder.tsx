import { styled } from '@linaria/react';
import { useContext, useState, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent, useIcons } from 'twenty-ui/display';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { useIsMobile } from 'twenty-ui/utilities';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/FolderIconDefault';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorFolder';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/common/contexts/NavigationMenuItemDragContext';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemsCollapsableContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsableContainer';

const StyledFolderExpandableWrapper = styled.div`
  & > div {
    overflow: visible !important;
  }
`;

export type SubItemsRenderParams = {
  navigationMenuItems: NavigationMenuItem[];
  selectedNavigationMenuItemIndex: number;
  isDragging: boolean;
  folderId: string;
};

type NavigationMenuItemFolderProps = {
  folderId: string;
  folderName: string;
  folderIconKey?: string | null;
  folderColor?: string | null;
  navigationMenuItems: NavigationMenuItem[];
  isGroup: boolean;
  isDragging?: boolean;

  isOpen: boolean;
  onToggle: () => void;
  selectedNavigationMenuItemIndex: number;

  headerIcon?: IconComponent;
  headerRightOptions?: ReactNode;
  headerActive?: boolean;
  alwaysShowRightOptions?: boolean;
  isRightOptionsDropdownOpen?: boolean;
  onHeaderClick?: () => void;

  headerOverride?: ReactNode;

  renderHeaderWrapper?: (header: ReactNode) => ReactNode;
  renderSubItems: (params: SubItemsRenderParams) => ReactNode;
  renderContainer?: (content: ReactNode) => ReactNode;

  containExpandOverflow?: boolean;
};

export const NavigationMenuItemFolder = ({
  folderId,
  folderName,
  folderIconKey,
  folderColor,
  navigationMenuItems,
  isGroup,
  isDragging: isDraggingProp = false,
  isOpen,
  onToggle,
  selectedNavigationMenuItemIndex,
  headerIcon: headerIconProp,
  headerRightOptions,
  headerActive,
  alwaysShowRightOptions,
  isRightOptionsDropdownOpen,
  onHeaderClick,
  headerOverride,
  renderHeaderWrapper,
  renderSubItems,
  renderContainer,
  containExpandOverflow = false,
}: NavigationMenuItemFolderProps) => {
  const isMobile = useIsMobile();
  const { getIcon } = useIcons();

  const { isDragging: isContextDragging } = useContext(
    NavigationMenuItemDragContext,
  );
  const isDragging = isDraggingProp || isContextDragging;

  const [skipInitialExpandAnimation] = useState(() => isOpen);

  const FolderIcon = getIcon(folderIconKey ?? FOLDER_ICON_DEFAULT);
  const iconColor = isDefined(folderColor)
    ? folderColor
    : DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER;

  const effectiveHeaderIcon = headerIconProp ?? FolderIcon;
  const handleClick = onHeaderClick ?? onToggle;

  const headerItem = (
    <NavigationDrawerItem
      label={folderName}
      Icon={effectiveHeaderIcon}
      iconColor={iconColor}
      active={headerActive}
      onClick={handleClick}
      rightOptions={headerRightOptions}
      className="navigation-drawer-item"
      isRightOptionsDropdownOpen={isRightOptionsDropdownOpen}
      triggerEvent="CLICK"
      preventCollapseOnMobile={isMobile}
      isDragging={isDragging}
      alwaysShowRightOptions={alwaysShowRightOptions}
    />
  );

  const header =
    headerOverride ??
    (renderHeaderWrapper ? renderHeaderWrapper(headerItem) : headerItem);

  const expandable = (
    <AnimatedExpandableContainer
      isExpanded={isOpen}
      dimension="height"
      mode="fit-content"
      containAnimation
      initial={!skipInitialExpandAnimation}
    >
      {renderSubItems({
        navigationMenuItems,
        selectedNavigationMenuItemIndex,
        isDragging,
        folderId,
      })}
    </AnimatedExpandableContainer>
  );

  const content = (
    <NavigationDrawerItemsCollapsableContainer isGroup={isGroup}>
      {header}
      {containExpandOverflow ? (
        <StyledFolderExpandableWrapper>
          {expandable}
        </StyledFolderExpandableWrapper>
      ) : (
        expandable
      )}
    </NavigationDrawerItemsCollapsableContainer>
  );

  if (renderContainer) {
    return renderContainer(content);
  }

  return content;
};
