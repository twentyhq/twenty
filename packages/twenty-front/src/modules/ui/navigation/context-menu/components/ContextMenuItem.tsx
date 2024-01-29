import { ContextMenuEntry } from '@/ui/navigation/context-menu/types/ContextMenuEntry';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';

type ContextMenuItemProps = {
  item: ContextMenuEntry;
  selectedIds: string[];
};

export const ContextMenuItem = ({
  item,
  selectedIds,
}: ContextMenuItemProps) => (
  <MenuItem
    LeftIcon={item.Icon}
    onClick={() => item.onClick(selectedIds)}
    accent={item.accent}
    text={item.label}
  />
);
