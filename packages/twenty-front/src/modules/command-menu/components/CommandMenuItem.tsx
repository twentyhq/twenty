import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';
import { IconArrowUpRight, IconComponent, MenuItemCommand } from 'twenty-ui';

import { useCommandMenuOnItemClick } from '@/command-menu/hooks/useCommandMenuOnItemClick';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { ReactNode } from 'react';

export type CommandMenuItemProps = {
  label: string;
  to?: string;
  id: string;
  onClick?: () => void;
  Icon?: IconComponent;
  firstHotKey?: string;
  secondHotKey?: string;
  shouldCloseCommandMenuOnClick?: boolean;
  RightComponent?: ReactNode;
};

export const CommandMenuItem = ({
  label,
  to,
  id,
  onClick,
  Icon,
  firstHotKey,
  secondHotKey,
  shouldCloseCommandMenuOnClick,
  RightComponent,
}: CommandMenuItemProps) => {
  const { onItemClick } = useCommandMenuOnItemClick();

  if (isNonEmptyString(to) && !Icon) {
    Icon = IconArrowUpRight;
  }

  const { isSelectedItemIdSelector } = useSelectableList();
  const isSelectedItemId = useRecoilValue(isSelectedItemIdSelector(id));

  return (
    <MenuItemCommand
      LeftIcon={Icon}
      text={label}
      firstHotKey={firstHotKey}
      secondHotKey={secondHotKey}
      onClick={() =>
        onItemClick({
          shouldCloseCommandMenuOnClick,
          onClick,
          to,
        })
      }
      isSelected={isSelectedItemId}
      RightComponent={RightComponent}
    />
  );
};
