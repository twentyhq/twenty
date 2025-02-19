import { getAggregateQueryName } from '@/object-record/utils/getAggregateQueryName';
import { useApolloClient } from '@apollo/client';

export const useRefetchAggregateQueries = ({
  objectMetadataNamePlural,
}: {
  objectMetadataNamePlural: string;
}) => {
  const apolloClient = useApolloClient();

  const refetchAggregateQueries = async () => {
    const queryName = getAggregateQueryName(objectMetadataNamePlural);

    await apolloClient.refetchQueries({
      include: [queryName],
    });
  };

  return {
    refetchAggregateQueries,
  };
};
