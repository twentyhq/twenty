import { type AvatarShape } from 'twenty-ui/data-display';
import { type IconComponent } from 'twenty-ui/icon';

export type SelectableItem<T = object> = T & {
  id: string;
  name: string;
  avatarUrl?: string;
  avatarShape?: AvatarShape;
  AvatarIcon?: IconComponent;
  isSelected: boolean;
  isIconInverted?: boolean;
};
