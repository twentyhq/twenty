import { AvatarType } from '@/users/components/Avatar';

export type ObjectMetadataConfig = {
  mainIdentifierFieldMetadataId: string;
  mainIdentifierMapper: (record: any) => {
    name: string;
    pictureUrl?: string;
    avatarType: AvatarType;
  };
  basePathToShowPage: string;
};
