import { type CompositeFieldSubFieldName } from 'twenty-shared/types';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
} from '~/generated/graphql';

type YAxisSortConfiguration = {
  currentOrderBy: string | null | undefined;
  groupByFieldMetadataIdY: string;
  groupBySubFieldNameY: CompositeFieldSubFieldName | undefined;
  getUpdateConfig: (orderBy: string) => Record<string, string>;
};

export const getYAxisSortConfiguration = (
  configuration: BarChartConfiguration | LineChartConfiguration,
): YAxisSortConfiguration => {
  if (configuration.__typename === 'BarChartConfiguration') {
    return {
      currentOrderBy: configuration.secondaryAxisOrderBy,
      groupByFieldMetadataIdY: configuration.secondaryAxisGroup ?? '',
      groupBySubFieldNameY: configuration.secondaryAxisSubFieldName as
        | CompositeFieldSubFieldName
        | undefined,
      getUpdateConfig: (orderBy: string) => ({ secondaryAxisOrderBy: orderBy }),
    };
  }

  if (configuration.__typename === 'LineChartConfiguration') {
    return {
      currentOrderBy: configuration.orderByY,
      groupByFieldMetadataIdY: configuration.groupByFieldMetadataIdY ?? '',
      groupBySubFieldNameY: configuration.groupBySubFieldNameY as
        | CompositeFieldSubFieldName
        | undefined,
      getUpdateConfig: (orderBy: string) => ({ orderByY: orderBy }),
    };
  }

  throw new Error('Invalid configuration type');
};
