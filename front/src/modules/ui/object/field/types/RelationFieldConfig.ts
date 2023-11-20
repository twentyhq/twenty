import { MainIdentifierMapper } from '@/ui/object/field/types/MainIdentifierMapper';

export type FieldDefinitionRelationType =
  | 'FROM_MANY_OBJECTS'
  | 'FROM_ONE_OBJECT'
  | 'TO_MANY_OBJECTS'
  | 'TO_ONE_OBJECT';

export type RelationFieldConfig = {
  relationType?: FieldDefinitionRelationType;
  mainIdentifierMapper: MainIdentifierMapper;
  searchFields: string[];
  objectMetadataNameSingular: string;
};
