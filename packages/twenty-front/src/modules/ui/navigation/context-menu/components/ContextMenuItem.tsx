import { MenuItem } from 'twenty-ui';

import { ContextMenuEntry } from '@/ui/navigation/context-menu/types/ContextMenuEntry';

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
