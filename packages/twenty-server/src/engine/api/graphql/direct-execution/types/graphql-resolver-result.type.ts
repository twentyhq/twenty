import { type ObjectRecord } from 'twenty-shared/types';

import { type CommonRelationsAggregatedValues } from 'src/engine/api/common/types/common-aggregated-values.type';
import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { type OrderByValuesByRecordId } from 'src/engine/api/utils/build-order-by-values-by-record-id.util';

export type GraphqlConnectionResult = {
  records: ObjectRecord[];
  // totalCount, aggregates and group-by dimension values, by connection field name
  connectionValues: Record<string, unknown>;
  relationAggregatedValues?: CommonRelationsAggregatedValues;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  order?: ObjectRecordOrderBy;
  orderByValuesByRecordId?: OrderByValuesByRecordId;
};

export type GraphqlResolverResult =
  | {
      kind: 'record';
      record: ObjectRecord;
      relationAggregatedValues?: CommonRelationsAggregatedValues;
    }
  | {
      kind: 'records';
      records: ObjectRecord[];
      relationAggregatedValues?: CommonRelationsAggregatedValues;
    }
  | { kind: 'connection'; connection: GraphqlConnectionResult }
  | { kind: 'connections'; connections: GraphqlConnectionResult[] }
  | { kind: 'groupByConnections'; connections: GraphqlConnectionResult[] };
