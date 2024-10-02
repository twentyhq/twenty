import { ActionMenuEntry } from '@/ui/navigation/action-menu/types/ActionMenuEntry';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

type ContextMenuItemProps = {
  item: ActionMenuEntry;
};

export const ContextMenuItem = ({ item }: ContextMenuItemProps) => (
  <MenuItem
    LeftIcon={item.Icon}
    onClick={item.onClick}
    accent={item.accent}
    text={item.label}
  />
);
