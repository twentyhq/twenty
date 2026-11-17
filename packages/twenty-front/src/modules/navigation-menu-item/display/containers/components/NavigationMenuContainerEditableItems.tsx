import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { NavigationMenuItemDisplay } from '@/navigation-menu-item/display/components/NavigationMenuItemDisplay';
import { NavigationMenuItemAddDropdown } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdown';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
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
  const { t } = useLingui();
  const [
    selectedNavigationMenuItemIdInEditMode,
    setSelectedNavigationMenuItemIdInEditMode,
  ] = useAtomState(selectedNavigationMenuItemIdInEditModeState);
  const folderCount = topLevelItems.filter(isNavigationMenuItemFolder).length;

  return (
    <StyledList>
      {topLevelItems.map((item, index) => (
        <NavigationMenuItemDisplay
          key={item.id}
          item={item}
          isDragging={false}
          folderChildrenById={folderChildrenById}
          folderCount={folderCount}
          orphanIndex={index}
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
      <NavigationMenuItemAddDropdown
        instanceId={`container-${containerId}`}
        parentId={containerId}
      >
        <NavigationDrawerItem
          Icon={IconPlus}
          label={t`Add menu item`}
          triggerEvent="CLICK"
          variant="tertiary"
        />
      </NavigationMenuItemAddDropdown>
    </StyledList>
  );
};
