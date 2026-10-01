import { useQuery } from '@apollo/client/react';

import { GetObjectAccessOverviewDocument } from '~/generated-metadata/graphql';

export const useObjectAccessOverview = ({
  objectMetadataId,
}: {
  objectMetadataId: string;
}) => {
  const { data, loading, error } = useQuery(GetObjectAccessOverviewDocument, {
    variables: { objectMetadataId },
    fetchPolicy: 'cache-and-network',
  });

  return {
    objectAccessOverview: data?.objectAccessOverview,
    loading,
    error,
  };
};
