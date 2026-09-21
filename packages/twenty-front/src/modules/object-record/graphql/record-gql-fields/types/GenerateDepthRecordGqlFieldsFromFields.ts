import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export type GenerateDepthRecordGqlFieldsFromFields = {
  objectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    | 'id'
    | 'fields'
    | 'labelIdentifierFieldMetadataId'
    | 'imageIdentifierFieldMetadataId'
    | 'nameSingular'
    | 'namePlural'
  >[];
  // Required to resolve the junction records held by the reverse side of a junction
  sourceObjectMetadataItem?: Pick<EnrichedObjectMetadataItem, 'id'>;
  fields: Pick<
    FieldMetadataItem,
    'id' | 'name' | 'type' | 'settings' | 'morphRelations' | 'relation'
  >[];
  depth: 0 | 1;
  shouldOnlyLoadRelationIdentifiers?: boolean;
};
