import { useApolloClient } from '@apollo/client';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';

type UseObjectMetadataViewsProps = {
  objectMetadataId: string | undefined;
};

export const useObjectMetadataViews = ({
  objectMetadataId,
}: UseObjectMetadataViewsProps) => {
  const apolloClient = useApolloClient();

  const { findManyRecordsQuery } = useFindManyRecordsQuery({
    objectNameSingular: CoreObjectNameSingular.View,
    recordGqlFields: {
      id: true,
      viewGroups: {
        id: true,
        fieldMetadataId: true,
        isVisible: true,
        fieldValue: true,
        position: true,
      },
    },
  });

  const fetchObjectMetadataViews = async () => {
    if (!objectMetadataId) {
      return;
    }

    return await apolloClient.query({
      query: findManyRecordsQuery,
      variables: {
        filter: {
          objectMetadataId: {
            eq: objectMetadataId,
          },
        },
      },
      fetchPolicy: 'network-only',
    });
  };

  return {
    fetchObjectMetadataViews,
  };
};
