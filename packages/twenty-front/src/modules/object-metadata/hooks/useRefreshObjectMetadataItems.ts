import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { enrichObjectMetadataItemsWithPermissions } from '@/object-metadata/utils/enrichObjectMetadataItemsWithPermissions';
import { mapPaginatedObjectMetadataItemsToObjectMetadataItems } from '@/object-metadata/utils/mapPaginatedObjectMetadataItemsToObjectMetadataItems';
import { type FetchPolicy, useApolloClient } from '@apollo/client';
import { useCallback } from 'react';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectMetadataItemsQuery } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { useStore } from 'jotai';

export const useRefreshObjectMetadataItems = (
  fetchPolicy: FetchPolicy = 'network-only',
) => {
  const store = useStore();
  const client = useApolloClient();

  const replaceObjectMetadataItemIfDifferent = useCallback(
    (
      toSetObjectMetadataItems: Omit<
        ObjectMetadataItem,
        'readableFields' | 'updatableFields'
      >[],
    ) => {
      const currentUserWorkspace = store.get(currentUserWorkspaceState.atom);

      if (!isDefined(currentUserWorkspace)) {
        return;
      }

      const objectPermissionsByObjectMetadataId =
        currentUserWorkspace.objectsPermissions.reduce(
          (acc, objectPermission) => {
            acc[objectPermission.objectMetadataId] = objectPermission;
            return acc;
          },
          {} as Record<
            string,
            ObjectPermissions & { objectMetadataId: string }
          >,
        );

      const newObjectMetadataItems = enrichObjectMetadataItemsWithPermissions({
        objectMetadataItems: toSetObjectMetadataItems,
        objectPermissionsByObjectMetadataId,
      });

      if (
        !isDeeplyEqual(
          store.get(objectMetadataItemsState.atom),
          newObjectMetadataItems,
        ) &&
        newObjectMetadataItems.length > 0
      ) {
        store.set(objectMetadataItemsState.atom, newObjectMetadataItems);
      }

      if (store.get(isAppEffectRedirectEnabledState.atom) === false) {
        store.set(isAppEffectRedirectEnabledState.atom, true);
      }

      return newObjectMetadataItems;
    },
    [store],
  );

  const refreshObjectMetadataItems = async () => {
    const objectMetadataItemsResult =
      await client.query<ObjectMetadataItemsQuery>({
        query: FIND_MANY_OBJECT_METADATA_ITEMS,
        variables: {},
        fetchPolicy,
      });

    const objectMetadataItems =
      mapPaginatedObjectMetadataItemsToObjectMetadataItems({
        pagedObjectMetadataItems: objectMetadataItemsResult.data,
      });

    return replaceObjectMetadataItemIfDifferent(objectMetadataItems);
  };

  return {
    refreshObjectMetadataItems,
  };
};
