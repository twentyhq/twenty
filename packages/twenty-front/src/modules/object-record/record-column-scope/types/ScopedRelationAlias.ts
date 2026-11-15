import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import {
  type RecordGqlOperationFilter,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';

export type ScopedRelationAlias = {
  ownerViewFieldId: string;
  alias: string;
  fieldName: string;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  filter?: RecordGqlOperationFilter;
  orderBy?: RecordGqlOperationOrderBy;
  first?: number;
  prefillRecordFilters: RecordFilter[];
};
