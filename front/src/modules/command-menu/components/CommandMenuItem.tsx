import { useNavigate } from 'react-router-dom';

import { IconArrowUpRight } from '@/ui/Display/Icon';
import { IconComponent } from '@/ui/Display/Icon/types/IconComponent';
import { MenuItemCommand } from '@/ui/Navigation/Menu Item/components/MenuItemCommand';

import { useCommandMenu } from '../hooks/useCommandMenu';

export type CommandMenuItemProps = {
  label: string;
  to?: string;
  key: string;
  onClick?: () => void;
  Icon?: IconComponent;
  shortcuts?: Array<string>;
};

export const CommandMenuItem = ({
  label,
  to,
  onClick,
  Icon,
  shortcuts,
}: CommandMenuItemProps) => {
  const navigate = useNavigate();
  const { closeCommandMenu } = useCommandMenu();

  if (to && !Icon) {
    Icon = IconArrowUpRight;
  }

  const onItemClick = () => {
    closeCommandMenu();

    if (onClick) {
      onClick();
      return;
    }
    if (to) {
      navigate(to);
      return;
    }
  };

  return (
    <MenuItemCommand
      LeftIcon={Icon}
      text={label}
      command={shortcuts ? shortcuts.join(' then ') : ''}
      onClick={onItemClick}
    />
  );
};
