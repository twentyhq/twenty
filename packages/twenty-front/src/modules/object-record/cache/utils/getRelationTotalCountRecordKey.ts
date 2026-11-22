import { getRelationAggregateRecordKey } from '@/object-record/cache/utils/getRelationAggregateRecordKey';

export const getRelationTotalCountRecordKey = (relationRecordKey: string) =>
  getRelationAggregateRecordKey({
    relationRecordKey,
    aggregateGqlFieldName: 'totalCount',
  });
