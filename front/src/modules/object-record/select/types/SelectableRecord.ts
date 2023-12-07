import { AvatarType } from '@/users/components/Avatar';

export type SelectableRecord = {
  id: string;
  name: string;
  avatarUrl?: string;
  avatarType?: AvatarType;
  record: any;
  isSelected: boolean;
};
