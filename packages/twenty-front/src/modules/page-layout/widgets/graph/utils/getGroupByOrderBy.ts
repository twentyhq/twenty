import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFieldOrderBy } from '@/page-layout/widgets/graph/utils/getFieldOrderBy';
import { mapOrderByToDirection } from '@/page-layout/widgets/graph/utils/mapOrderByToDirection';
import {
  type AggregateOrderByWithGroupByField,
  type ObjectRecordGroupByDateGranularity,
  type ObjectRecordOrderByForCompositeField,
  type ObjectRecordOrderByForRelationField,
  type ObjectRecordOrderByForScalarField,
  type ObjectRecordOrderByWithGroupByDateField,
} from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { GraphOrderBy } from '~/generated/graphql';

export const getGroupByOrderBy = ({
  graphOrderBy,
  groupByField,
  groupBySubFieldName,
  aggregateOperation,
  dateGranularity,
}: {
  graphOrderBy: GraphOrderBy;
  groupByField: FieldMetadataItem;
  groupBySubFieldName?: string | null;
  aggregateOperation?: string;
  dateGranularity?: ObjectRecordGroupByDateGranularity;
}):
  | AggregateOrderByWithGroupByField
  | ObjectRecordOrderByForScalarField
  | ObjectRecordOrderByWithGroupByDateField
  | ObjectRecordOrderByForCompositeField
  | ObjectRecordOrderByForRelationField
  | undefined => {
  switch (graphOrderBy) {
    case GraphOrderBy.FIELD_ASC:
    case GraphOrderBy.FIELD_DESC:
      return getFieldOrderBy(
        groupByField,
        groupBySubFieldName,
        dateGranularity,
        mapOrderByToDirection(graphOrderBy),
      );
    case GraphOrderBy.VALUE_ASC:
    case GraphOrderBy.VALUE_DESC: {
      if (!isDefined(aggregateOperation)) {
        throw new Error(
          `Aggregate operation not found (field: ${groupByField.name})`,
        );
      }

      return {
        aggregate: {
          [aggregateOperation]: mapOrderByToDirection(graphOrderBy),
        },
      };
    }
    case GraphOrderBy.FIELD_POSITION_ASC:
    case GraphOrderBy.FIELD_POSITION_DESC:
    case GraphOrderBy.MANUAL:
      return undefined;
    default:
      assertUnreachable(graphOrderBy);
  }
};
