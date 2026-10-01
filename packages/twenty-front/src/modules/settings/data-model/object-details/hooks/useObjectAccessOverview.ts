import { useQuery } from '@apollo/client/react';

import { GetObjectAccessOverviewDocument } from '~/generated-metadata/graphql';

export const useObjectAccessOverview = ({
  objectMetadataId,
}: {
  objectMetadataId: string;
}) => {
  const { data, loading } = useQuery(GetObjectAccessOverviewDocument, {
    variables: { objectMetadataId },
    fetchPolicy: 'network-only',
  });

  return { objectAccessOverview: data?.objectAccessOverview, loading };
};
