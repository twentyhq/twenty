import { ContextMenuEntry } from '@/ui/navigation/context-menu/types/ContextMenuEntry';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

type ContextMenuItemProps = {
  item: ContextMenuEntry;
};

export const ContextMenuItem = ({ item }: ContextMenuItemProps) => (
  <MenuItem
    LeftIcon={item.Icon}
    onClick={item.onClick}
    accent={item.accent}
    text={item.label}
  />
);
