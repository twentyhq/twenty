import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { generateGroupByAggregateQuery } from '@/object-record/record-aggregate/utils/generateGroupByAggregateQuery';
import { getAvailableAggregationsFromObjectFields } from '@/object-record/utils/getAvailableAggregationsFromObjectFields';
import { useGraphWidgetQueryCommon } from '@/page-layout/widgets/graph/hooks/useGraphWidgetQueryCommon';
import { type GroupByChartConfiguration } from '@/page-layout/widgets/graph/types/GroupByChartConfiguration';
import { generateGroupByQueryVariablesFromBarOrLineChartConfiguration } from '@/page-layout/widgets/graph/utils/generateGroupByQueryVariablesFromBarOrLineChartConfiguration';
import { generateGroupByQueryVariablesFromPieChartConfiguration } from '@/page-layout/widgets/graph/utils/generateGroupByQueryVariablesFromPieChartConfiguration';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { DEFAULT_NUMBER_OF_GROUPS_LIMIT } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
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

  const { userTimezone } = useUserTimezone();

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

  const groupByQueryVariables = isWidgetConfigurationOfType(
    configuration,
    'PieChartConfiguration',
  )
    ? generateGroupByQueryVariablesFromPieChartConfiguration({
        objectMetadataItem,
        objectMetadataItems,
        chartConfiguration: configuration,
        aggregateOperation: aggregateOperation,
        limit,
        firstDayOfTheWeek: calendarStartDay,
        userTimeZone: userTimezone,
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
        userTimeZone: userTimezone,
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
