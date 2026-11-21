import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
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
};
