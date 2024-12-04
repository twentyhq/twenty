import { getAggregateQueryName } from '@/object-record/utils/getAggregateQueryName';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useApolloClient } from '@apollo/client';

export const useRefetchAggregateQueries = ({
  objectMetadataNamePlural,
}: {
  objectMetadataNamePlural: string;
}) => {
  const apolloClient = useApolloClient();
  const isAggregateQueryEnabled = useIsFeatureEnabled(
    'IS_AGGREGATE_QUERY_ENABLED',
  );
  const refetchAggregateQueries = async () => {
    const queryName = getAggregateQueryName(objectMetadataNamePlural);

    if (isAggregateQueryEnabled) {
      await apolloClient.refetchQueries({
        include: [queryName],
      });
    }
  };

  return {
    refetchAggregateQueries,
  };
};
