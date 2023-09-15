import { IconComponent } from '@/ui/icon/types/IconComponent';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';

import { ContextMenuItemAccent } from '../types/ContextMenuItemAccent';

type OwnProps = {
  Icon: IconComponent;
  label: string;
  accent?: ContextMenuItemAccent;
  onClick: () => void;
};

export function ContextMenuItem({
  label,
  Icon,
  accent = 'default',
  onClick,
}: OwnProps) {
  return (
    <MenuItem LeftIcon={Icon} onClick={onClick} accent={accent} text={label} />
  );
}
