import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export type JunctionObjectMetadataItem = Pick<
  EnrichedObjectMetadataItem,
  | 'id'
  | 'fields'
  | 'readableFields'
  | 'labelIdentifierFieldMetadataId'
  | 'imageIdentifierFieldMetadataId'
  | 'nameSingular'
  | 'namePlural'
>;
