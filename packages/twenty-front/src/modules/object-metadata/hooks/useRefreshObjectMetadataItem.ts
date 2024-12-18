import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { isAppWaitingForFreshObjectMetadataState } from '@/object-metadata/states/isAppWaitingForFreshObjectMetadataState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapPaginatedObjectMetadataItemsToObjectMetadataItems } from '@/object-metadata/utils/mapPaginatedObjectMetadataItemsToObjectMetadataItems';
import { useRecoilCallback } from 'recoil';
import { ObjectMetadataItemsQuery } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type FetchPolicy = 'network-only' | 'cache-first';

export const useRefreshObjectMetadataItems = (
  fetchPolicy: FetchPolicy = 'cache-first',
) => {
  const client = useApolloMetadataClient();

  const refreshObjectMetadataItems = async () => {
    const result = await client.query<ObjectMetadataItemsQuery>({
      query: FIND_MANY_OBJECT_METADATA_ITEMS,
      variables: {},
      fetchPolicy,
    });

    const objectMetadataItems =
      mapPaginatedObjectMetadataItemsToObjectMetadataItems({
        pagedObjectMetadataItems: result.data,
      });

    replaceObjectMetadataItemIfDifferent(objectMetadataItems);
  };

  const replaceObjectMetadataItemIfDifferent = useRecoilCallback(
    ({ set, snapshot }) =>
      (toSetObjectMetadataItems: ObjectMetadataItem[]) => {
        if (
          !isDeeplyEqual(
            snapshot.getLoadable(objectMetadataItemsState).getValue(),
            toSetObjectMetadataItems,
          )
        ) {
          set(objectMetadataItemsState, toSetObjectMetadataItems);
          set(isAppWaitingForFreshObjectMetadataState, false);
        }
      },
    [],
  );
  return {
    refreshObjectMetadataItems,
  };
};
