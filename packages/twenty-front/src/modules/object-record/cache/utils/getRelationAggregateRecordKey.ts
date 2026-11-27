import { capitalize } from 'twenty-shared/utils';

// A record holds a relation as a plain list, so each aggregate of its connection lives under a sibling key
export const getRelationAggregateRecordKey = ({
  relationRecordKey,
  aggregateGqlFieldName,
}: {
  relationRecordKey: string;
  aggregateGqlFieldName: string;
}) => `${relationRecordKey}${capitalize(aggregateGqlFieldName)}`;
