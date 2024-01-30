import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { MenuItemAccent } from '@/ui/navigation/menu-item/types/MenuItemAccent';

export type ContextMenuEntry = {
  label: string;
  Icon: IconComponent;
  accent?: MenuItemAccent;
  onClick: () => void;
};
