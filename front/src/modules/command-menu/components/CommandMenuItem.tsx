import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  enterClicked?: boolean;
  resetEnterClicked?: () => void;
};

export const CommandMenuItem = ({
  label,
  to,
  id,
  onClick,
  Icon,
  firstHotKey,
  secondHotKey,
  enterClicked,
  resetEnterClicked,
}: CommandMenuItemProps) => {
  const navigate = useNavigate();
  const { toggleCommandMenu } = useCommandMenu();

  if (to && !Icon) {
    Icon = IconArrowUpRight;
  }

  const { isSelectedItemId } = useSelectableList({ itemId: id });

  const onItemClick = useCallback(() => {
    toggleCommandMenu();

    if (onClick) {
      onClick();
      return;
    }
    if (to) {
      navigate(to);
      return;
    }
  }, [navigate, onClick, to, toggleCommandMenu]);

  useEffect(() => {
    if (enterClicked && isSelectedItemId) {
      onItemClick();
      resetEnterClicked?.();
    }
  }, [enterClicked, isSelectedItemId, onItemClick, resetEnterClicked]);

  return (
    <MenuItemCommand
      LeftIcon={Icon}
      text={label}
      firstHotKey={firstHotKey}
      secondHotKey={secondHotKey}
      onClick={onItemClick}
      isSelected={isSelectedItemId}
    />
  );
};
