import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import {
  IconChevronDown,
  IconChevronUp,
  IconDotsVertical,
  IconTrash,
} from 'twenty-ui/icon';

import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { usePinnedCommandsEdit } from '@/navigation-menu-item/edit/hooks/usePinnedCommandsEdit';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';

type NavigationMenuItemPinnedCommandActionsProps = {
  navigationMenuItemId: string;
};

export const NavigationMenuItemPinnedCommandActions = ({
  navigationMenuItemId,
}: NavigationMenuItemPinnedCommandActionsProps) => {
  const { t } = useLingui();
  const { canMove, moveUp, moveDown, remove } = usePinnedCommandsEdit();

  return (
    <DropdownRoot
      dropdownId={`navigation-pinned-command-actions-${navigationMenuItemId}`}
      type="menu"
    >
      <Dropdown.Trigger
        render={
          <LightIconButton
            emphasis="subtle"
            size="sm"
            aria-label={t`Menu item actions`}
          >
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <DropdownContent
        side="right"
        align="start"
        width={GenericDropdownContentWidth.Large}
      >
        <Dropdown.Section>
          <NavigationMenuItemSelectableItem
            item={{
              id: 'up',
              label: t`Move up`,
              Icon: IconChevronUp,
              isDisabled: !canMove(navigationMenuItemId, -1),
              onClick: () => moveUp(navigationMenuItemId),
            }}
          />
          <NavigationMenuItemSelectableItem
            item={{
              id: 'down',
              label: t`Move down`,
              Icon: IconChevronDown,
              isDisabled: !canMove(navigationMenuItemId, 1),
              onClick: () => moveDown(navigationMenuItemId),
            }}
          />
          <NavigationMenuItemSelectableItem
            item={{
              id: 'remove',
              label: t`Remove from sidebar`,
              Icon: IconTrash,
              accent: 'danger',
              onClick: () => remove(navigationMenuItemId),
            }}
          />
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
