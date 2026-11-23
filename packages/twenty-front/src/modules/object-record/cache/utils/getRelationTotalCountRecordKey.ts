import { TOTAL_COUNT_GQL_FIELD_NAME } from '@/object-record/constants/TotalCountGqlFieldName';
import { getRelationAggregateRecordKey } from '@/object-record/cache/utils/getRelationAggregateRecordKey';

export const getRelationTotalCountRecordKey = (relationRecordKey: string) =>
  getRelationAggregateRecordKey({
    relationRecordKey,
    aggregateGqlFieldName: TOTAL_COUNT_GQL_FIELD_NAME,
  });
