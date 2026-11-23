import { useLingui } from '@lingui/react/macro';
import { IconPlus } from 'twenty-ui/icon';
import { NavigationMenuItemEntrance } from '@/navigation-menu-item/edit/components/NavigationMenuItemEntrance';
import { NavigationMenuItemAddDropdown } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdown';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

type WorkspaceSectionAddMenuItemButtonProps = {
  container?: { id: string; itemCount: number };
};

export const WorkspaceSectionAddMenuItemButton = ({
  container,
}: WorkspaceSectionAddMenuItemButtonProps) => {
  const { t } = useLingui();
  const button = (
    <NavigationDrawerItem
      Icon={IconPlus}
      label={t`Add item`}
      triggerEvent="CLICK"
      variant="tertiary"
    />
  );

  return (
    <NavigationMenuItemEntrance>
      {container === undefined ? (
        <NavigationMenuItemAddDropdown>{button}</NavigationMenuItemAddDropdown>
      ) : (
        <NavigationMenuItemAddDropdown
          instanceId={`container-${container.id}`}
          parentId={container.id}
          position={container.itemCount}
        >
          {button}
        </NavigationMenuItemAddDropdown>
      )}
    </NavigationMenuItemEntrance>
  );
};
