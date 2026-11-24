import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordFieldLookupTarget } from '@/object-record/record-column-lookup/types/RecordFieldLookupTarget';
import { type RecordFieldSummary } from '@/object-record/record-column-summary/types/RecordFieldSummary';
import { type ScopedRelationJunction } from '@/object-record/record-column-scope/types/ScopedRelationJunction';
import { type RecordGqlFieldsRelationWithArguments } from 'twenty-shared/types';

export type ScopedRelationAlias = {
  recordFieldId: string;
  responseKey: string;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  relationWithArguments: RecordGqlFieldsRelationWithArguments;
  lookupTarget?: RecordFieldLookupTarget;
  summary?: RecordFieldSummary;
  scopedRelationJunction?: ScopedRelationJunction;
  // The related object and every object the scope filters or sorts through, whose writes can change the result
  reachedObjectMetadataItemIds: string[];
  // A scope or shown field the user cannot read would make the server reject the whole query
  isRestricted: boolean;
};
