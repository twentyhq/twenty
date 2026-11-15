import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import {
  type RecordGqlOperationFilter,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';

export type RecordGqlRelationAlias = {
  alias: string;
  fieldName: string;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  filter?: RecordGqlOperationFilter;
  orderBy?: RecordGqlOperationOrderBy;
  first?: number;
};
