import { useApolloClient } from '@apollo/client';
import { Modifiers } from '@apollo/client/cache';

import { EMPTY_MUTATION } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { capitalize } from '~/utils/string/capitalize';

export const useModifyRecordFromCache = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const apolloClient = useApolloClient();

  return (recordId: string, fieldModifiers: Modifiers) => {
    if (!objectMetadataItem) {
      return EMPTY_MUTATION;
    }

    const cache = apolloClient.cache;
    const cachedRecordId = cache.identify({
      __typename: capitalize(objectMetadataItem.nameSingular),
      id: recordId,
    });

    cache.modify({
      id: cachedRecordId,
      fields: fieldModifiers,
    });
  };
};
