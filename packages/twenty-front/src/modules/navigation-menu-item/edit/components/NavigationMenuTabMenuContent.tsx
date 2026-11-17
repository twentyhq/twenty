import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconTrash } from 'twenty-ui/icon';

import { currentNavigationMenuTabIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuTabIdState';
import { NavigationMenuItemContainerNameEditor } from '@/navigation-menu-item/edit/components/NavigationMenuItemContainerNameEditor';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { useNavigationMenuItemMoveRemove } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemMoveRemove';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuTabMenuContentProps = {
  tab: Pick<NavigationMenuItem, 'id' | 'name' | 'icon'>;
  onClose: () => void;
};

export const NavigationMenuTabMenuContent = ({
  tab,
  onClose,
}: NavigationMenuTabMenuContentProps) => {
  const { t } = useLingui();
  const setCurrentNavigationMenuTabId = useSetAtomState(
    currentNavigationMenuTabIdState,
  );
  const { remove } = useNavigationMenuItemMoveRemove('workspace');

  return (
    <>
      <NavigationMenuItemContainerNameEditor
        item={tab}
        placeholder={t`Tab name`}
        hasIconPicker
        onSubmit={onClose}
      />
      <Dropdown.Separator />
      <Dropdown.Section>
        <NavigationMenuItemSelectableItem
          item={{
            id: 'delete',
            label: t`Delete tab`,
            Icon: IconTrash,
            accent: 'danger',
            onClick: () => {
              setCurrentNavigationMenuTabId(null);
              void remove(tab.id);
              onClose();
            },
          }}
        />
      </Dropdown.Section>
    </>
  );
};
