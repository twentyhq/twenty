import { type AvatarType } from 'twenty-ui/data-display';
import { type IconComponent } from 'twenty-ui/icon';

export type SelectableItem<T = object> = T & {
  id: string;
  name: string;
  avatarUrl?: string;
  avatarType?: AvatarType;
  AvatarIcon?: IconComponent;
  isSelected: boolean;
  isIconInverted?: boolean;
};
