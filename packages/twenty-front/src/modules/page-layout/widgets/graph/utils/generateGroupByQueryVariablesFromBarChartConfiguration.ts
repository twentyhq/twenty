import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { type BarChartConfiguration, GraphOrderBy } from '~/generated/graphql';
import { buildGroupByFieldObject } from './buildGroupByFieldObject';

const _mapOrderByToDirection = (orderByEnum: GraphOrderBy) => {
  switch (orderByEnum) {
    case GraphOrderBy.FIELD_ASC:
      return 'AscNullsLast';
    case GraphOrderBy.FIELD_DESC:
      return 'DescNullsLast';
    case GraphOrderBy.VALUE_ASC:
      return 'AscNullsLast';
    case GraphOrderBy.VALUE_DESC:
      return 'DescNullsLast';
    default:
      assertUnreachable(orderByEnum);
  }
};

export const generateGroupByQueryVariablesFromBarChartConfiguration = ({
  objectMetadataItem,
  barChartConfiguration,
}: {
  objectMetadataItem: ObjectMetadataItem;
  barChartConfiguration: BarChartConfiguration;
}) => {
  const groupByFieldXId =
    barChartConfiguration.primaryAxisGroupByFieldMetadataId;

  const groupByFieldYId =
    barChartConfiguration.secondaryAxisGroupByFieldMetadataId;

  const groupBySubFieldNameX =
    barChartConfiguration.primaryAxisGroupBySubFieldName ?? undefined;

  const groupBySubFieldNameY =
    barChartConfiguration.secondaryAxisGroupBySubFieldName ?? undefined;

  const groupByFieldX = objectMetadataItem.fields.find(
    (field) => field.id === groupByFieldXId,
  );

  const groupByFieldY = isDefined(groupByFieldYId)
    ? objectMetadataItem.fields.find((field) => field.id === groupByFieldYId)
    : undefined;

  if (!isDefined(groupByFieldX) || !isDefined(groupByFieldXId)) {
    throw new Error(
      `Field with id ${groupByFieldXId} not found in object metadata`,
    );
  }

  const groupBy: Array<
    Record<string, boolean | Record<string, boolean | string>>
  > = [];

  groupBy.push(
    buildGroupByFieldObject({
      field: groupByFieldX,
      subFieldName: groupBySubFieldNameX,
    }),
  );

  if (isDefined(groupByFieldY)) {
    groupBy.push(
      buildGroupByFieldObject({
        field: groupByFieldY,
        subFieldName: groupBySubFieldNameY,
      }),
    );
  }

  const orderBy: Array<Record<string, string>> = [];

  // TODO: Add orderBy back in when the backend is ready
  // if (isDefined(barChartConfiguration.primaryAxisOrderBy)) {
  //   orderBy.push({
  //     [groupByFieldX.name]: mapOrderByToDirection(
  //       barChartConfiguration.primaryAxisOrderBy!,
  //     ),
  //   });
  // }

  // if (
  //   isDefined(groupByFieldY) &&
  //   isDefined(barChartConfiguration.secondaryAxisOrderBy)
  // ) {
  //   orderBy.push({
  //     [groupByFieldY.name]: mapOrderByToDirection(
  //       barChartConfiguration.secondaryAxisOrderBy!,
  //     ),
  //   });
  // }

  return {
    groupBy,
    // TODO: Add filters
    ...(orderBy.length > 0 && { orderBy }),
  };
};
