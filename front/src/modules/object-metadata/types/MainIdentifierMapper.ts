import { AvatarType } from '@/users/components/Avatar';

export type MainIdentifierMapper = (dataObject: any) => {
  name: string;
  pictureUrl?: string;
  avatarType: AvatarType;
};
