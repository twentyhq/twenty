import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { generateAggregateQuery } from '@/object-record/utils/generateAggregateQuery';
import { useGraphWidgetQueryCommon } from '@/page-layout/widgets/graph/hooks/useGraphWidgetQueryCommon';
import { useQuery } from '@apollo/client';
import { type NumberChartConfiguration } from '~/generated/graphql';

export const useGraphWidgetAggregateQuery = ({
  objectMetadataItemId,
  configuration,
}: {
  objectMetadataItemId: string;
  configuration: NumberChartConfiguration;
}) => {
  const {
    objectMetadataItem,
    aggregateOperation: aggregateOperationFieldName,
    filterQueryVariables,
  } = useGraphWidgetQueryCommon({
    objectMetadataItemId,
    configuration,
  });

  const recordGqlFields = {
    [aggregateOperationFieldName]: true,
  };

  const query = generateAggregateQuery({
    objectMetadataItem,
    recordGqlFields,
  });

  const apolloCoreClient = useApolloCoreClient();

  const { data, loading, error, refetch } = useQuery(query, {
    client: apolloCoreClient,
    variables: filterQueryVariables,
  });

  return {
    value: data?.[objectMetadataItem.namePlural]?.[aggregateOperationFieldName],
    loading,
    error,
    refetch,
  };
};
