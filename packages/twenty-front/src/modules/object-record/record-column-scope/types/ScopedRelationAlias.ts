import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGqlFieldsRelationWithArguments } from 'twenty-shared/types';

export type ScopedRelationAlias = {
  recordFieldId: string;
  responseKey: string;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  relationWithArguments: RecordGqlFieldsRelationWithArguments;
};
