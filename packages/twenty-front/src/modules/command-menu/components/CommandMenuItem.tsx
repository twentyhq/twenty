import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode } from 'react';
import { IconArrowUpRight, type IconComponent } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

import { useCommandMenuOnItemClick } from '@/command-menu/hooks/useCommandMenuOnItemClick';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';

export type CommandMenuItemProps = {
  label: string;
  description?: string;
  to?: string;
  id: string;
  onClick?: () => void;
  Icon?: IconComponent;
  hotKeys?: string[];
  LeftComponent?: ReactNode;
  RightComponent?: ReactNode;
  contextualTextPosition?: 'left' | 'right';
  hasSubMenu?: boolean;
  isSubMenuOpened?: boolean;
  disabled?: boolean;
};

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

  const isSelectedItemId = useRecoilComponentFamilyValue(
    isSelectedItemIdComponentFamilySelector,
    id,
  );

  return (
    <MenuItem
      withIconContainer={!LeftComponent}
      LeftIcon={LeftComponent ? undefined : Icon}
      LeftComponent={LeftComponent}
      text={label}
      contextualText={description}
      contextualTextPosition={contextualTextPosition}
      hotKeys={hotKeys}
      onClick={
        onClick || to
          ? () =>
              onItemClick({
                onClick,
                to,
              })
          : undefined
      }
      focused={isSelectedItemId}
      RightComponent={RightComponent}
      hasSubMenu={hasSubMenu}
      isSubMenuOpened={isSubMenuOpened}
      disabled={disabled}
    />
  );
};
