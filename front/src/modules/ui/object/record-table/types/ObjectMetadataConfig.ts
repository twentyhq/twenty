import { AvatarType } from '@/users/components/Avatar';

export type ObjectMetadataConfig = {
  mainIdentifierFieldMetadataId: string;
  labelIdentifierFieldPaths: string[];
  imageIdentifierUrlField: string;
  imageIdentifierUrlPrefix: string;
  imageIdentifierFormat: AvatarType;
  basePathToShowPage: string;
};
