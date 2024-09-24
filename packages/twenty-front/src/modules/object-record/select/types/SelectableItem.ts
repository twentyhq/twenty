import { AvatarType } from 'twenty-ui';

export type SelectableItem<T = object> = T & {
  id: string;
  name: string;
  avatarUrl?: string;
  avatarType?: AvatarType;
  isSelected: boolean;
};
