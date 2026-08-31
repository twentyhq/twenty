import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export type JunctionObjectMetadataItem = Pick<
  EnrichedObjectMetadataItem,
  | 'id'
  | 'fields'
  | 'labelIdentifierFieldMetadataId'
  | 'imageIdentifierFieldMetadataId'
  | 'nameSingular'
  | 'namePlural'
>;
