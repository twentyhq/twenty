import { AvatarType } from '@/users/components/Avatar';

export type MainIdentifierMapper = (record: any) => {
  id: string;
  name: string;
  avatarUrl?: string;
  avatarType: AvatarType;
  record: any;
};
