import { getAggregateQueryName } from '@/object-record/utils/getAggregateQueryName';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useApolloClient } from '@apollo/client';
import { FeatureFlagKey } from '~/generated/graphql';

export const useRefetchAggregateQueries = ({
  objectMetadataNamePlural,
}: {
  objectMetadataNamePlural: string;
}) => {
  const apolloClient = useApolloClient();
  const isAggregateQueryEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsAggregateQueryEnabled,
  );
  const refetchAggregateQueries = async () => {
    if (isAggregateQueryEnabled) {
      const queryName = getAggregateQueryName(objectMetadataNamePlural);

      await apolloClient.refetchQueries({
        include: [queryName],
      });
    }
  };

  return {
    refetchAggregateQueries,
  };
};
