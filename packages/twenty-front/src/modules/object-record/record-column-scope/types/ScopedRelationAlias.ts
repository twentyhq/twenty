import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordFieldLookupTarget } from '@/object-record/record-column-lookup/types/RecordFieldLookupTarget';
import { type RecordFieldSummary } from '@/object-record/record-column-summary/types/RecordFieldSummary';
import { type ScopedRelationJunction } from '@/object-record/record-column-scope/types/ScopedRelationJunction';
import {
  type RecordGqlOperationFilter,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';

export type ScopedRelationAlias = {
  recordFieldId: string;
  responseKey: string;
  relationFieldName: string;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  filter?: RecordGqlOperationFilter;
  orderBy?: RecordGqlOperationOrderBy;
  first?: number;
  lookupTarget?: RecordFieldLookupTarget;
  summary?: RecordFieldSummary;
  scopedRelationJunction?: ScopedRelationJunction;
};
