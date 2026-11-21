import { type ViewFieldRelationScope } from 'twenty-shared/types';
import { type AggregateOperations as RelationAggregateOperation } from '@/object-record/record-table/constants/AggregateOperations';
import { type AggregateOperations } from '~/generated-metadata/graphql';

export type RecordField = {
  id: string;
  fieldMetadataItemId: string;
  position: number;
  isVisible: boolean;
  isCanonical?: boolean;
  size: number;
  aggregateOperation?: AggregateOperations | null;
  relationTargetFieldMetadataId?: string | null;
  relationScope?: ViewFieldRelationScope | null;
  label?: string | null;
  relationAggregateOperation?: RelationAggregateOperation | null;
};
