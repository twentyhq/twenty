import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { NavigationMenuItemDisplay } from '@/navigation-menu-item/display/components/NavigationMenuItemDisplay';
import { WorkspaceSectionAddMenuItemButton } from '@/navigation-menu-item/edit/components/WorkspaceSectionAddMenuItemButton';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
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
  const [
    selectedNavigationMenuItemIdInEditMode,
    setSelectedNavigationMenuItemIdInEditMode,
  ] = useAtomState(selectedNavigationMenuItemIdInEditModeState);
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
            onEditModeClick: () =>
              setSelectedNavigationMenuItemIdInEditMode(item.id),
          }}
          onNavigationMenuItemClick={({ item: clickedItem }) =>
            setSelectedNavigationMenuItemIdInEditMode(clickedItem.id)
          }
        />
      ))}
      <WorkspaceSectionAddMenuItemButton
        container={{ id: containerId, itemCount: topLevelItems.length }}
      />
    </StyledList>
  );
};
