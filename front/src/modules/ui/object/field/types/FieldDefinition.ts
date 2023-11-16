import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { AvatarType } from '@/users/components/Avatar';

import { FieldMetadata } from './FieldMetadata';
import { FieldType } from './FieldType';

export type FieldDefinitionRelationType =
  | 'TO_ONE_OBJECT'
  | 'FROM_NAMY_OBJECTS'
  | 'TO_MANY_OBJECTS';

export type FieldDefinition<T extends FieldMetadata> = {
  fieldMetadataId: string;
  label: string;
  Icon?: IconComponent;
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
