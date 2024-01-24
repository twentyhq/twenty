import { gql, useApolloClient } from '@apollo/client';

import { useMapFieldMetadataToGraphQLQuery } from '@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { capitalize } from '~/utils/string/capitalize';

export const useGetRecordFromCache = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const mapFieldMetadataToGraphQLQuery = useMapFieldMetadataToGraphQLQuery();
  const apolloClient = useApolloClient();

  return <CachedObjectRecord extends ObjectRecord = ObjectRecord>(
    recordId: string,
  ) => {
    if (!objectMetadataItem) {
      return null;
    }

    const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

    const cacheReadFragment = gql`
      fragment ${capitalizedObjectName}Fragment on ${capitalizedObjectName} {
        id
        ${objectMetadataItem.fields
          .map((field) => mapFieldMetadataToGraphQLQuery(field))
          .join('\n')}
      }
    `;

    const cache = apolloClient.cache;
    const cachedRecordId = cache.identify({
      __typename: capitalize(objectMetadataItem.nameSingular),
      id: recordId,
    });

    return cache.readFragment<CachedObjectRecord>({
      id: cachedRecordId,
      fragment: cacheReadFragment,
    });
  };
};
