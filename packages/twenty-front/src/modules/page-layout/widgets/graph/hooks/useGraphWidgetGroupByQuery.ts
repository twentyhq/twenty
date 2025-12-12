import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { generateGroupByAggregateQuery } from '@/object-record/record-aggregate/utils/generateGroupByAggregateQuery';
import { getAvailableAggregationsFromObjectFields } from '@/object-record/utils/getAvailableAggregationsFromObjectFields';
import { useGraphWidgetQueryCommon } from '@/page-layout/widgets/graph/hooks/useGraphWidgetQueryCommon';
import { type GroupByChartConfiguration } from '@/page-layout/widgets/graph/types/GroupByChartConfiguration';
import { generateGroupByQueryVariablesFromBarOrLineChartConfiguration } from '@/page-layout/widgets/graph/utils/generateGroupByQueryVariablesFromBarOrLineChartConfiguration';
import { generateGroupByQueryVariablesFromPieChartConfiguration } from '@/page-layout/widgets/graph/utils/generateGroupByQueryVariablesFromPieChartConfiguration';
import { generateGroupByQueryVariablesFromWaffleChartConfiguration } from '@/page-layout/widgets/graph/utils/generateGroupByQueryVariablesFromWaffleChartConfiguration';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { DEFAULT_NUMBER_OF_GROUPS_LIMIT } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
  type PieChartConfiguration,
  type WaffleChartConfiguration,
} from '~/generated/graphql';


export const useGraphWidgetGroupByQuery = ({
  objectMetadataItemId,
  configuration,
  limit = DEFAULT_NUMBER_OF_GROUPS_LIMIT,
}: {
  objectMetadataItemId: string;
  configuration: GroupByChartConfiguration;
  limit?: number;
}) => {
  const { calendarStartDay } = useDateTimeFormat();

  const { objectMetadataItem, aggregateField, gqlOperationFilter } =
    useGraphWidgetQueryCommon({
      objectMetadataItemId,
      configuration,
    });

  const { objectMetadataItems } = useObjectMetadataItems();

  if (!isDefined(aggregateField)) {
    throw new Error('Aggregate field not found');
  }

  const availableAggregations = useMemo(
    () =>
      getAvailableAggregationsFromObjectFields(
        objectMetadataItem.readableFields,
      ),
    [objectMetadataItem.readableFields],
  );

  const aggregateOperation =
    availableAggregations[aggregateField.name]?.[
      configuration.aggregateOperation
    ];

  if (!isDefined(aggregateOperation)) {
    throw new Error('Aggregate operation not found');
  }

  const isPieChart = (
    config: GroupByChartConfiguration,
  ): config is PieChartConfiguration => {
    return config.__typename === 'PieChartConfiguration';
  };
  
  const isWaffleChart = (
    config: GroupByChartConfiguration,
  ): config is WaffleChartConfiguration => {
	  return config.__typename === 'WaffleChartConfiguration';
  };
  
  const groupByQueryVariables = isPieChart(configuration)
    ? generateGroupByQueryVariablesFromPieChartConfiguration({
        objectMetadataItem,
        objectMetadataItems,
        chartConfiguration: configuration,
        aggregateOperation: aggregateOperation,
        limit,
        firstDayOfTheWeek: calendarStartDay,
      })
    : isWaffleChart(configuration)
	? generateGroupByQueryVariablesFromWaffleChartConfiguration({
		objectMetadataItem,
		objectMetadataItems,
		chartConfiguration: configuration,
		aggregateOperation: aggregateOperation,
		limit,
		firstDayOfTheWeek: calendarStartDay,
	  })
	: generateGroupByQueryVariablesFromBarOrLineChartConfiguration({
        objectMetadataItem,
        objectMetadataItems,
        chartConfiguration: configuration as
          | BarChartConfiguration
          | LineChartConfiguration,
        aggregateOperation: aggregateOperation,
        limit,
        firstDayOfTheWeek: calendarStartDay,
      });


  const variables = {
    ...groupByQueryVariables,
    filter: gqlOperationFilter,
  };

  const groupByAggregateQuery = generateGroupByAggregateQuery({
    objectMetadataItem,
    aggregateOperationGqlFields: [aggregateOperation],
  });

  const apolloCoreClient = useApolloCoreClient();

  const { data, loading, error, refetch } = useQuery(groupByAggregateQuery, {
    client: apolloCoreClient,
    variables,
  });

  return {
    data,
    loading,
    error,
    refetch,
    aggregateOperation: aggregateOperation,
  };
};
