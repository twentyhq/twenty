import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { GRAPH_DEFAULT_DATE_GRANULARITY } from '@/page-layout/widgets/graph/constants/GraphDefaultDateGranularity.constant';
import {
  OrderByDirection,
  type AggregateOrderByWithGroupByField,
  type ObjectRecordGroupByDateGranularity,
  type ObjectRecordOrderByForCompositeField,
  type ObjectRecordOrderByForRelationField,
  type ObjectRecordOrderByForScalarField,
  type ObjectRecordOrderByWithGroupByDateField,
} from 'twenty-shared/types';
import {
  assertUnreachable,
  isDefined,
  isFieldMetadataDateKind,
} from 'twenty-shared/utils';
import { GraphOrderBy } from '~/generated/graphql';

const mapOrderByToDirection = (orderByEnum: GraphOrderBy): OrderByDirection => {
  switch (orderByEnum) {
    case GraphOrderBy.FIELD_ASC:
      return OrderByDirection.AscNullsLast;
    case GraphOrderBy.FIELD_DESC:
      return OrderByDirection.DescNullsLast;
    case GraphOrderBy.VALUE_ASC:
      return OrderByDirection.AscNullsLast;
    case GraphOrderBy.VALUE_DESC:
      return OrderByDirection.DescNullsLast;
    default:
      assertUnreachable(orderByEnum);
  }
};

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
  | ObjectRecordOrderByForRelationField => {
  switch (graphOrderBy) {
    case GraphOrderBy.FIELD_ASC:
    case GraphOrderBy.FIELD_DESC: {
      if (isCompositeFieldType(groupByField.type)) {
        if (!isDefined(groupBySubFieldName)) {
          throw new Error(
            `Group by subFieldName is required for composite fields (field: ${groupByField.name})`,
          );
        }
        return {
          [groupByField.name]: {
            [groupBySubFieldName]: mapOrderByToDirection(graphOrderBy),
          },
        };
      } else if (isFieldMetadataDateKind(groupByField.type)) {
        return {
          [groupByField.name]: {
            orderBy: mapOrderByToDirection(graphOrderBy),
            granularity: dateGranularity ?? GRAPH_DEFAULT_DATE_GRANULARITY,
          },
        };
      } else if (
        isFieldRelation(groupByField) ||
        isFieldMorphRelation(groupByField)
      ) {
        if (!isDefined(groupBySubFieldName)) {
          return {
            [`${groupByField.name}Id`]: mapOrderByToDirection(graphOrderBy),
          };
        }

        const parts = groupBySubFieldName.split('.');
        const nestedFieldName = parts[0];
        const nestedSubFieldName = parts[1];

        const direction = mapOrderByToDirection(graphOrderBy);

        if (isDefined(nestedSubFieldName)) {
          return {
            [groupByField.name]: {
              [nestedFieldName]: {
                [nestedSubFieldName]: direction,
              },
            },
          };
        }

        return {
          [groupByField.name]: {
            [nestedFieldName]: direction,
          },
        };
      } else {
        return {
          [groupByField.name]: mapOrderByToDirection(graphOrderBy),
        };
      }
    }
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
    default:
      assertUnreachable(graphOrderBy);
  }
};
