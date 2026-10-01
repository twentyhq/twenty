import { type CommandMenuItemProps } from '@/command-menu/types/CommandMenuItemProps';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { MenuItem } from 'twenty-ui/components';
import { IconArrowUpRight } from 'twenty-ui/icon';

import { useCommandMenuOnItemClick } from '@/command-menu/hooks/useCommandMenuOnItemClick';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { isDefined } from 'twenty-shared/utils';

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
  const { t } = useLingui();
  const { onItemClick } = useCommandMenuOnItemClick();

  if (isNonEmptyString(to) && !Icon) {
    Icon = IconArrowUpRight;
  }

  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    id,
  );

  return (
    <MenuItem
      withIconContainer={!isDefined(LeftComponent)}
      LeftIcon={isDefined(LeftComponent) ? undefined : Icon}
      LeftComponent={LeftComponent}
      text={label}
      contextualText={description}
      contextualTextPosition={contextualTextPosition}
      shortcut={isDefined(hotKeys) ? hotKeys.map((key) => [key]) : undefined}
      shortcutJoinLabel={t`then`}
      onClick={
        onClick || to
          ? () =>
              onItemClick({
                onClick,
                to,
              })
          : undefined
      }
      focused={!disabled && isSelectedItemId}
      RightComponent={RightComponent}
      hasSubMenu={hasSubMenu}
      isSubMenuOpened={isSubMenuOpened}
      disabled={disabled}
    />
  );
};
