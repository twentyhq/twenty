import { IconComponent } from '@/ui/icon/types/IconComponent';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';

type ContextMenuEntryAccent = 'default' | 'danger';

type OwnProps = {
  Icon: IconComponent;
  label: string;
  accent?: ContextMenuEntryAccent;
  onClick: () => void;
};

export const ContextMenuEntry = ({
  label,
  Icon,
  accent = 'default',
  onClick,
}: OwnProps) => (
  <MenuItem LeftIcon={Icon} onClick={onClick} accent={accent} text={label} />
);
