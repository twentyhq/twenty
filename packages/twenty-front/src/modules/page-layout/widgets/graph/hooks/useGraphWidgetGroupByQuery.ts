import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useGraphWidgetQueryCommon } from '@/page-layout/widgets/graph/hooks/useGraphWidgetQueryCommon';
import { generateGroupByQuery } from '@/page-layout/widgets/graph/utils/generateGroupByQuery';
import { generateGroupByQueryVariablesFromBarChartConfiguration } from '@/page-layout/widgets/graph/utils/generateGroupByQueryVariablesFromBarChartConfiguration';
import { useQuery } from '@apollo/client';
import { type BarChartConfiguration } from '~/generated-metadata/graphql';

export const useGraphWidgetGroupByQuery = ({
  objectMetadataItemId,
  configuration,
}: {
  objectMetadataItemId: string;
  configuration: BarChartConfiguration;
}) => {
  const { objectMetadataItem, aggregateOperation, filterQueryVariables } =
    useGraphWidgetQueryCommon({
      objectMetadataItemId,
      configuration,
    });

  const groupByQueryVariables =
    generateGroupByQueryVariablesFromBarChartConfiguration({
      objectMetadataItem,
      barChartConfiguration: configuration,
      aggregateOperation,
    });

  const variables = {
    ...groupByQueryVariables,
    ...filterQueryVariables,
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
    aggregateOperation,
  };
};
