import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { NavigationMenuItemDisplay } from '@/navigation-menu-item/display/components/NavigationMenuItemDisplay';
import { useEditModeNavigationMenuItemClick } from '@/navigation-menu-item/edit/hooks/useEditModeNavigationMenuItemClick';
import { WorkspaceSectionAddMenuItemButton } from '@/navigation-menu-item/edit/components/WorkspaceSectionAddMenuItemButton';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.betweenSiblingsGap};
  padding-top: ${themeCssVariables.betweenSiblingsGap};
`;

type NavigationMenuContainerEditableItemsProps = {
  containerId: string;
  topLevelItems: NavigationMenuItem[];
  folderChildrenById: Map<string, NavigationMenuItem[]>;
};

export const NavigationMenuContainerEditableItems = ({
  containerId,
  topLevelItems,
  folderChildrenById,
}: NavigationMenuContainerEditableItemsProps) => {
  const selectedNavigationMenuItemIdInEditMode = useAtomStateValue(
    selectedNavigationMenuItemIdInEditModeState,
  );
  const handleNavigationMenuItemClick = useEditModeNavigationMenuItemClick();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const folderCount = topLevelItems.filter(isNavigationMenuItemFolder).length;

  return (
    <StyledList>
      {topLevelItems.map((item) => (
        <NavigationMenuItemDisplay
          key={item.id}
          item={item}
          isDragging={false}
          folderChildrenById={folderChildrenById}
          folderCount={folderCount}
          editModeProps={{
            isSelectedInEditMode:
              selectedNavigationMenuItemIdInEditMode === item.id,
            onEditModeClick: () => handleNavigationMenuItemClick({ item }),
          }}
          onNavigationMenuItemClick={handleNavigationMenuItemClick}
        />
      ))}
      <WorkspaceSectionAddMenuItemButton
        container={{
          id: containerId,
          itemCount: workspaceNavigationMenuItems.filter(
            (item) => item.parentId === containerId,
          ).length,
        }}
      />
    </StyledList>
  );
};
