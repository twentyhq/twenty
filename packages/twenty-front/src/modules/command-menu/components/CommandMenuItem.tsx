import { useRecoilValue } from 'recoil';

import { IconArrowUpRight } from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
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

  if (to && !Icon) {
    Icon = IconArrowUpRight;
  }

  const { isSelectedItemIdFamilyState } = useSelectableList();
  const isSelectedItemId = useRecoilValue(isSelectedItemIdFamilyState(id));

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
