import { AvatarType } from '@/users/components/Avatar';

export type EntityForSelect = {
  id: string;
  name: string;
  avatarUrl?: string;
  avatarType?: AvatarType;
  record: any;
};
