import { type CompositeFieldSubFieldName } from 'twenty-shared/types';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
} from '~/generated/graphql';

type XAxisSortConfiguration = {
  currentOrderBy: string | null | undefined;
  groupByFieldMetadataIdX: string;
  groupBySubFieldNameX: CompositeFieldSubFieldName | undefined;
  getUpdateConfig: (orderBy: string) => Record<string, string>;
};

export const getXAxisSortConfiguration = (
  configuration: BarChartConfiguration | LineChartConfiguration,
): XAxisSortConfiguration => {
  if (configuration.__typename === 'BarChartConfiguration') {
    return {
      currentOrderBy: configuration.primaryAxisOrderBy,
      groupByFieldMetadataIdX: configuration.primaryAxisGroup ?? '',
      groupBySubFieldNameX: configuration.primaryAxisSubFieldName as
        | CompositeFieldSubFieldName
        | undefined,
      getUpdateConfig: (orderBy: string) => ({ primaryAxisOrderBy: orderBy }),
    };
  }

  if (configuration.__typename === 'LineChartConfiguration') {
    return {
      currentOrderBy: configuration.orderByX,
      groupByFieldMetadataIdX: configuration.groupByFieldMetadataIdX ?? '',
      groupBySubFieldNameX: configuration.groupBySubFieldNameX as
        | CompositeFieldSubFieldName
        | undefined,
      getUpdateConfig: (orderBy: string) => ({ orderByX: orderBy }),
    };
  }

  throw new Error('Invalid configuration type');
};
