import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { IconTrash } from 'twenty-ui/icon';

import { currentNavigationMenuTabIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuTabIdState';
import { NavigationMenuItemContainerNameEditor } from '@/navigation-menu-item/edit/components/NavigationMenuItemContainerNameEditor';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { useNavigationMenuContainerReorderOptions } from '@/navigation-menu-item/edit/hooks/useNavigationMenuContainerReorderOptions';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemMoveRemove';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuTabMenuContentProps = {
  tab: Pick<NavigationMenuItem, 'id' | 'name' | 'icon'>;
};

export const NavigationMenuTabMenuContent = ({
  tab,
}: NavigationMenuTabMenuContentProps) => {
  const { t } = useLingui();
  const { closeDropdown } = useCloseDropdown();
  const setCurrentNavigationMenuTabId = useSetAtomState(
    currentNavigationMenuTabIdState,
  );
  const { remove } = useNavigationMenuItemMoveRemove('workspace');
  const reorderOptions = useNavigationMenuContainerReorderOptions({
    itemId: tab.id,
    type: NavigationMenuItemType.TAB,
    containerId: null,
    onMoved: () => closeDropdown(),
  });

  return (
    <>
      <NavigationMenuItemContainerNameEditor
        item={tab}
        placeholder={t`Tab name`}
        hasIconPicker
        onSubmit={() => closeDropdown()}
      />
      <Dropdown.Separator />
      <Dropdown.Section>
        {reorderOptions.map((option) => (
          <NavigationMenuItemSelectableItem key={option.id} item={option} />
        ))}
        <NavigationMenuItemSelectableItem
          item={{
            id: 'delete',
            label: t`Delete tab`,
            Icon: IconTrash,
            accent: 'danger',
            onClick: () => {
              setCurrentNavigationMenuTabId(null);
              void remove(tab.id);
              closeDropdown();
            },
          }}
        />
      </Dropdown.Section>
    </>
  );
};
