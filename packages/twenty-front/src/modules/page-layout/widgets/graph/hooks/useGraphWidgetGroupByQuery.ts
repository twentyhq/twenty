import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { getAvailableAggregationsFromObjectFields } from '@/object-record/utils/getAvailableAggregationsFromObjectFields';
import { generateGroupByQuery } from '@/page-layout/utils/generateGroupByQuery';
import { generateGroupByQueryVariablesFromBarChartConfiguration } from '@/page-layout/utils/generateGroupByQueryVariablesFromBarChartConfiguration';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type BarChartConfiguration } from '~/generated-metadata/graphql';

export const useGraphWidgetGroupByQuery = ({
  objectMetadataItemId,
  configuration,
}: {
  objectMetadataItemId: string;
  configuration: BarChartConfiguration;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const availableAggregations = useMemo(
    () =>
      getAvailableAggregationsFromObjectFields(
        objectMetadataItem.readableFields,
      ),
    [objectMetadataItem.readableFields],
  );

  const aggregateFieldId = configuration.aggregateFieldMetadataId;

  const aggregateField = objectMetadataItem.fields.find(
    (field) => field.id === aggregateFieldId,
  );

  if (!isDefined(aggregateField)) {
    throw new Error('Aggregate field not found');
  }

  const aggregateOperation =
    availableAggregations[aggregateField?.name]?.[
      configuration.aggregateOperation
    ];

  if (!isDefined(aggregateOperation)) {
    throw new Error('Aggregate operation not found');
  }

  const query = generateGroupByQuery({
    objectMetadataItem,
    aggregateOperations: [aggregateOperation],
  });

  const variables = generateGroupByQueryVariablesFromBarChartConfiguration({
    objectMetadataItem,
    barChartConfiguration: configuration,
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
    variables,
    aggregateOperation,
  };
};
