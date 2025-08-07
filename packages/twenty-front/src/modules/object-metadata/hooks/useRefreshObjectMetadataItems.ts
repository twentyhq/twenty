import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { isAppWaitingForFreshObjectMetadataState } from '@/object-metadata/states/isAppWaitingForFreshObjectMetadataState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapPaginatedObjectMetadataItemsToObjectMetadataItems } from '@/object-metadata/utils/mapPaginatedObjectMetadataItemsToObjectMetadataItems';
import { FetchPolicy, useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';
import { ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  ObjectMetadataItemsQuery,
  useGetCurrentUserLazyQuery,
} from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useRefreshObjectMetadataItems = (
  fetchPolicy: FetchPolicy = 'network-only',
) => {
  const [getCurrentUser] = useGetCurrentUserLazyQuery();

  const client = useApolloClient();
  const refreshObjectMetadataItems = async () => {
    const objectMetadataItemsResult =
      await client.query<ObjectMetadataItemsQuery>({
        query: FIND_MANY_OBJECT_METADATA_ITEMS,
        variables: {},
        fetchPolicy,
      });

    const currentUserResult = await getCurrentUser({
      fetchPolicy: 'network-only',
    });

    if (isDefined(currentUserResult.error)) {
      throw new Error(currentUserResult.error.message);
    }

    const user = currentUserResult.data?.currentUser;

    if (!isDefined(user?.currentUserWorkspace?.objectPermissions)) {
      return {
        objectMetadataItems: [],
        currentUser: user,
      };
    }

    const objectPermissionsByObjectMetadataId =
      user.currentUserWorkspace.objectPermissions.reduce(
        (acc, objectPermission) => {
          acc[objectPermission.objectMetadataId] =
            objectPermission as ObjectPermissions & {
              objectMetadataId: string;
            };
          return acc;
        },
        {} as Record<string, ObjectPermissions & { objectMetadataId: string }>,
      );

    const objectMetadataItems =
      mapPaginatedObjectMetadataItemsToObjectMetadataItems({
        pagedObjectMetadataItems: objectMetadataItemsResult.data,
        objectPermissionsByObjectMetadataId,
      });

    replaceObjectMetadataItemIfDifferent(objectMetadataItems);

    return {
      objectMetadataItems,
      currentUser: user,
    };
  };

  const replaceObjectMetadataItemIfDifferent = useRecoilCallback(
    ({ set, snapshot }) =>
      (toSetObjectMetadataItems: ObjectMetadataItem[]) => {
        if (
          !isDeeplyEqual(
            snapshot.getLoadable(objectMetadataItemsState).getValue(),
            toSetObjectMetadataItems,
          ) &&
          toSetObjectMetadataItems.length > 0
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
