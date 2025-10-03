import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { type BarChartConfiguration, GraphOrderBy } from '~/generated/graphql';

const mapOrderByToDirection = (orderByEnum: GraphOrderBy) => {
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
  viewId,
}: {
  objectMetadataItem: ObjectMetadataItem;
  barChartConfiguration: BarChartConfiguration;
  viewId?: string;
}) => {
  const groupByFieldX = objectMetadataItem.fields.find(
    (field) => field.id === barChartConfiguration.groupByFieldMetadataIdX,
  );

  const groupByFieldY = objectMetadataItem.fields.find(
    (field) => field.id === barChartConfiguration.groupByFieldMetadataIdY,
  );

  if (!isDefined(groupByFieldX)) {
    throw new Error(
      `Field with id ${barChartConfiguration.groupByFieldMetadataIdX} not found in object metadata`,
    );
  }

  const groupBy: Array<Record<string, boolean | Record<string, boolean>>> = [
    { [groupByFieldX.name]: true },
  ];

  if (isDefined(groupByFieldY)) {
    groupBy.push({ [groupByFieldY.name]: true });
  }

  const orderBy: Array<Record<string, string>> = [];

  // if (isDefined(barChartConfiguration.orderByX)) {
  //   orderBy.push({
  //     [groupByFieldX.name]: mapOrderByToDirection(
  //       barChartConfiguration.orderByX,
  //     ),
  //   });
  // }

  // if (isDefined(groupByFieldY) && isDefined(barChartConfiguration.orderByY)) {
  //   orderBy.push({
  //     [groupByFieldY.name]: mapOrderByToDirection(
  //       barChartConfiguration.orderByY,
  //     ),
  //   });
  // }

  return {
    groupBy,
    ...(barChartConfiguration.filter && {
      filter: barChartConfiguration.filter,
    }),
    ...(orderBy.length > 0 && { orderBy }),
    ...(isDefined(viewId) && { viewId }),
  };
};
