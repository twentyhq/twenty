import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { NavigationMenuItemEntrance } from '@/navigation-menu-item/edit/components/NavigationMenuItemEntrance';
import { NavigationMenuItemAddDropdown } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdown';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

type WorkspaceSectionAddMenuItemButtonProps = {
  containerId?: string | null;
  position?: number;
};

export const WorkspaceSectionAddMenuItemButton = ({
  containerId = null,
  position = 0,
}: WorkspaceSectionAddMenuItemButtonProps) => {
  const { t } = useLingui();
  const button = (
    <NavigationDrawerItem
      Icon={IconPlus}
      label={t`Add menu item`}
      triggerEvent="CLICK"
      variant="tertiary"
    />
  );

  return (
    <NavigationMenuItemEntrance>
      {isDefined(containerId) ? (
        <NavigationMenuItemAddDropdown
          instanceId={`container-${containerId}`}
          folderId={containerId}
          position={position}
        >
          {button}
        </NavigationMenuItemAddDropdown>
      ) : (
        <NavigationMenuItemAddDropdown>{button}</NavigationMenuItemAddDropdown>
      )}
    </NavigationMenuItemEntrance>
  );
};
