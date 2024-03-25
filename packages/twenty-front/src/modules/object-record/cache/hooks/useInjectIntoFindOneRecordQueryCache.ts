import { useApolloClient } from '@apollo/client';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useGenerateFindOneRecordQuery } from '@/object-record/hooks/useGenerateFindOneRecordQuery';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { capitalize } from '~/utils/string/capitalize';

export const useInjectIntoFindOneRecordQueryCache = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const apolloClient = useApolloClient();

  const generateFindOneRecordQuery = useGenerateFindOneRecordQuery();

  const injectIntoFindOneRecordQueryCache = <
    T extends ObjectRecord = ObjectRecord,
  >(
    record: T,
    depth = 1,
  ) => {
    const findOneRecordQueryForCacheInjection = generateFindOneRecordQuery({
      objectMetadataItem,

      depth,
      objectRecord: record,
    });

    apolloClient.writeQuery({
      query: findOneRecordQueryForCacheInjection,
      variables: {
        objectRecordId: record.id,
      },
      data: {
        [objectMetadataItem.nameSingular]: {
          __typename: `${capitalize(objectMetadataItem.nameSingular)}`,
          ...record,
        },
      },
    });
  };

  return {
    injectIntoFindOneRecordQueryCache,
  };
};
