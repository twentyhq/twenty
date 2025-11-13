import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { getAvailableAggregationsFromObjectFields } from '@/object-record/utils/getAvailableAggregationsFromObjectFields';
import { useGraphWidgetQueryCommon } from '@/page-layout/widgets/graph/hooks/useGraphWidgetQueryCommon';
import { type GroupByChartConfiguration } from '@/page-layout/widgets/graph/types/GroupByChartConfiguration';
import { generateGroupByQuery } from '@/page-layout/widgets/graph/utils/generateGroupByQuery';
import { generateGroupByQueryVariablesFromChartConfiguration } from '@/page-layout/widgets/graph/utils/generateGroupByQueryVariablesFromChartConfiguration';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useGraphWidgetGroupByQuery = ({
  objectMetadataItemId,
  configuration,
}: {
  objectMetadataItemId: string;
  configuration: GroupByChartConfiguration;
}) => {
  const { objectMetadataItem, aggregateField, gqlOperationFilter } =
    useGraphWidgetQueryCommon({
      objectMetadataItemId,
      configuration,
    });

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

  const groupByQueryVariables =
    generateGroupByQueryVariablesFromChartConfiguration({
      objectMetadataItem,
      chartConfiguration: configuration,
      aggregateOperation: aggregateOperation,
    });

  const variables = {
    ...groupByQueryVariables,
    filter: gqlOperationFilter,
  };

  const query = generateGroupByQuery({
    objectMetadataItem,
    aggregateOperations: [aggregateOperation],
  });

  const apolloCoreClient = useApolloCoreClient();

  const { data, loading, error, refetch } = useQuery(query, {
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
