import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGqlFieldsRelationWithArguments } from 'twenty-shared/types';

export type ScopedRelationAlias = {
  recordFieldId: string;
  responseKey: string;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  relationWithArguments: RecordGqlFieldsRelationWithArguments;
  // The related object and every object the scope filters or sorts through, whose writes can change the result
  reachedObjectMetadataItemIds: string[];
  // A scope on a field the user cannot read would make the server reject the whole query
  isRestricted: boolean;
};
