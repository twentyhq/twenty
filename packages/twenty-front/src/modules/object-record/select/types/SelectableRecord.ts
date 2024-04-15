import { AvatarType } from 'twenty-ui';

export type SelectableRecord = {
  id: string;
  name: string;
  avatarUrl?: string;
  avatarType?: AvatarType;
  record: any;
  isSelected: boolean;
};
