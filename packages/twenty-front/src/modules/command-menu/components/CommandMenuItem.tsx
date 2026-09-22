import { ListItemIcon } from '@/ui/navigation/list-item/components/ListItemIcon';
import { isNonEmptyString } from '@sniptt/guards';
import { IconArrowUpRight } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';

import { useCommandMenuOnItemClick } from '@/command-menu/hooks/useCommandMenuOnItemClick';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { isDefined } from 'twenty-shared/utils';

import { type CommandMenuItemProps } from '@/command-menu/types/CommandMenuItemProps';

export const CommandMenuItem = ({
  label,
  description,
  contextualTextPosition = 'left',
  to,
  id,
  onClick,
  Icon,
  hotKeys,
  LeftComponent,
  RightComponent,
  hasSubMenu = false,
  isSubMenuOpened = false,
  disabled = false,
}: CommandMenuItemProps) => {
  const { onItemClick } = useCommandMenuOnItemClick();

  if (isNonEmptyString(to) && !Icon) {
    Icon = IconArrowUpRight;
  }

  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    id,
  );

  return (
    <ListItem
      hotkeys={hotKeys ?? undefined}
      onClick={
        onClick || to
          ? (event) => {
              event.preventDefault();
              onItemClick({
                onClick,
                to,
              });
            }
          : undefined
      }
      focused={!disabled && isSelectedItemId}
      hasSubmenu={hasSubMenu}
      submenuOpen={isSubMenuOpened}
      disabled={disabled}
      startIcon={
        <>
          <ListItemIcon
            icon={isDefined(LeftComponent) ? undefined : Icon}
            container={!isDefined(LeftComponent) ? 'soft' : 'none'}
          />
          {LeftComponent}
        </>
      }
      endIcon={RightComponent}
      description={description}
      descriptionPlacement={
        contextualTextPosition === 'right' ? 'end' : 'inline'
      }
    >
      {label}
    </ListItem>
  );
};
