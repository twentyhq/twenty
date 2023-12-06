import { AvatarType } from '@/users/components/Avatar';

export type RecordToSelect = {
  id: string;
  name: string;
  avatarUrl?: string;
  avatarType?: AvatarType;
  record: any;
  isSelected: boolean;
};
