import { styled } from '@linaria/react';
import { IconChevronDown, IconChevronRight, useIcons } from 'twenty-ui/display';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceNavigationMenuItemFolderSubItem } from '@/navigation-menu-item/components/WorkspaceNavigationMenuItemFolderSubItem';
import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/constants/FolderIconDefault';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/constants/NavigationMenuItemDefaultColorFolder';
import { useWorkspaceFolderOpenState } from '@/navigation-menu-item/hooks/useWorkspaceFolderOpenState';
import type { ProcessedNavigationMenuItem } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemsCollapsableContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsableContainer';

const StyledFolderContainer = styled.div`
  border: 1px solid transparent;
  border-radius: ${themeCssVariables.border.radius.sm};
`;

const StyledFolderContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledFolderExpandableWrapper = styled.div`
  & > div {
    overflow: visible !important;
  }
`;

type WorkspaceFolderReadOnlyProps = {
  folderId: string;
  folderName: string;
  folderIconKey?: string | null;
  folderColor?: string | null;
  navigationMenuItems: ProcessedNavigationMenuItem[];
  isGroup: boolean;
};

export const WorkspaceFolderReadOnly = ({
  folderId,
  folderName,
  folderIconKey,
  folderColor,
  navigationMenuItems,
  isGroup,
}: WorkspaceFolderReadOnlyProps) => {
  const { getIcon } = useIcons();
  const FolderIcon = getIcon(folderIconKey ?? FOLDER_ICON_DEFAULT);
  const isMobile = useIsMobile();
  const { isOpen, handleToggle, selectedNavigationMenuItemIndex } =
    useWorkspaceFolderOpenState({ folderId, navigationMenuItems });

  const [skipInitialExpandAnimation] = useState(() => isOpen);

  return (
    <StyledFolderContainer>
      <NavigationDrawerItemsCollapsableContainer isGroup={isGroup}>
        <NavigationDrawerItem
          label={folderName}
          Icon={FolderIcon}
          iconColor={
            isDefined(folderColor)
              ? folderColor
              : DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER
          }
          active={!isOpen && selectedNavigationMenuItemIndex >= 0}
          onClick={handleToggle}
          className="navigation-drawer-item"
          triggerEvent="CLICK"
          preventCollapseOnMobile={isMobile}
          alwaysShowRightOptions
          rightOptions={
            isOpen ? (
              <IconChevronDown
                size={themeCssVariables.icon.size.sm}
                stroke={themeCssVariables.icon.stroke.sm}
                color={themeCssVariables.font.color.tertiary}
              />
            ) : (
              <IconChevronRight
                size={themeCssVariables.icon.size.sm}
                stroke={themeCssVariables.icon.stroke.sm}
                color={themeCssVariables.font.color.tertiary}
              />
            )
          }
        />
        <StyledFolderExpandableWrapper>
          <AnimatedExpandableContainer
            isExpanded={isOpen}
            dimension="height"
            mode="fit-content"
            containAnimation
            initial={!skipInitialExpandAnimation}
          >
            <StyledFolderContent>
              {navigationMenuItems.map((navigationMenuItem, index) => (
                <WorkspaceNavigationMenuItemFolderSubItem
                  key={navigationMenuItem.id}
                  navigationMenuItem={navigationMenuItem}
                  index={index}
                  arrayLength={navigationMenuItems.length}
                  selectedNavigationMenuItemIndex={
                    selectedNavigationMenuItemIndex
                  }
                  onNavigationMenuItemClick={undefined}
                  selectedNavigationMenuItemId={null}
                  isContextDragging={false}
                />
              ))}
            </StyledFolderContent>
          </AnimatedExpandableContainer>
        </StyledFolderExpandableWrapper>
      </NavigationDrawerItemsCollapsableContainer>
    </StyledFolderContainer>
  );
};
