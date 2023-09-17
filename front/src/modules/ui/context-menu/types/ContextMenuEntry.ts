import { IconComponent } from '@/ui/icon/types/IconComponent';

import { ContextMenuItemAccent } from './ContextMenuItemAccent';

export type ContextMenuEntry = {
  label: string;
  Icon: IconComponent;
  accent?: ContextMenuItemAccent;
  onClick: () => void;
};
