import { IconComponent } from '@/ui/icon/types/IconComponent';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';

type ContextMenuEntryAccent = 'default' | 'danger';

type OwnProps = {
  Icon: IconComponent;
  label: string;
  accent?: ContextMenuEntryAccent;
  onClick: () => void;
};

export function ContextMenuEntry({
  label,
  Icon,
  accent = 'default',
  onClick,
}: OwnProps) {
  return (
    <MenuItem LeftIcon={Icon} onClick={onClick} accent={accent} text={label} />
  );
}
