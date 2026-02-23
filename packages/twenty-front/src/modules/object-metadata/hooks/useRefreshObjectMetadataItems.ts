import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { enrichObjectMetadataItemsWithPermissions } from '@/object-metadata/utils/enrichObjectMetadataItemsWithPermissions';
import { mapPaginatedObjectMetadataItemsToObjectMetadataItems } from '@/object-metadata/utils/mapPaginatedObjectMetadataItemsToObjectMetadataItems';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type FetchPolicy, useApolloClient } from '@apollo/client';
import { useCallback } from 'react';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectMetadataItemsQuery } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useRefreshObjectMetadataItems = (
  fetchPolicy: FetchPolicy = 'network-only',
) => {
  const client = useApolloClient();

  const replaceObjectMetadataItemIfDifferent = useCallback(
    (
      toSetObjectMetadataItems: Omit<
        ObjectMetadataItem,
        'readableFields' | 'updatableFields'
      >[],
    ) => {
      const currentUserWorkspace = jotaiStore.get(
        currentUserWorkspaceState.atom,
      );

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
          jotaiStore.get(objectMetadataItemsState.atom),
          newObjectMetadataItems,
        ) &&
        newObjectMetadataItems.length > 0
      ) {
        jotaiStore.set(objectMetadataItemsState.atom, newObjectMetadataItems);
      }

      if (jotaiStore.get(isAppEffectRedirectEnabledState.atom) === false) {
        jotaiStore.set(isAppEffectRedirectEnabledState.atom, true);
      }

      return newObjectMetadataItems;
    },
    [],
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
