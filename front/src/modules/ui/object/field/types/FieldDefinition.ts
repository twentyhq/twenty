import { AvatarType } from '@/users/components/Avatar';

import { FieldMetadata } from './FieldMetadata';
import { FieldType } from './FieldType';

export type FieldDefinitionRelationType =
  | 'FROM_MANY_OBJECTS'
  | 'FROM_ONE_OBJECT'
  | 'TO_MANY_OBJECTS'
  | 'TO_ONE_OBJECT';

export type FieldDefinition<T extends FieldMetadata> = {
  fieldMetadataId: string;
  label: string;
  iconName: string;
  type: FieldType;
  metadata: T;
  basePathToShowPage?: string;
  infoTooltipContent?: string;
  entityChipDisplayMapper?: (dataObject: any) => {
    name: string;
    pictureUrl?: string;
    avatarType: AvatarType;
  };
  relationType?: FieldDefinitionRelationType;
};
