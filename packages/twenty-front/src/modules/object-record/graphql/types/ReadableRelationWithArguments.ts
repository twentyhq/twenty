import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordGqlFieldsRelationWithArguments } from 'twenty-shared/types';

export type ReadableRelationWithArguments = {
  responseKey: string;
  relationWithArguments: RecordGqlFieldsRelationWithArguments;
  relationFieldMetadataItem: FieldMetadataItem;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
};
