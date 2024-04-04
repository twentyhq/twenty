import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';
import { IconArrowUpRight, IconComponent } from 'twenty-ui';

import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { MenuItemCommand } from '@/ui/navigation/menu-item/components/MenuItemCommand';

import { useCommandMenu } from '../hooks/useCommandMenu';

export type CommandMenuItemProps = {
  label: string;
  to?: string;
  id: string;
  onClick?: () => void;
  Icon?: IconComponent;
  firstHotKey?: string;
  secondHotKey?: string;
};

export const CommandMenuItem = ({
  label,
  to,
  id,
  onClick,
  Icon,
  firstHotKey,
  secondHotKey,
}: CommandMenuItemProps) => {
  const { onItemClick } = useCommandMenu();

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
      onClick={() => onItemClick(onClick, to)}
      isSelected={isSelectedItemId}
    />
  );
};
