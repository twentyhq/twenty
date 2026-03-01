import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { shouldAppBeLoadingState } from '@/object-metadata/states/shouldAppBeLoadingState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { enrichObjectMetadataItemsWithPermissions } from '@/object-metadata/utils/enrichObjectMetadataItemsWithPermissions';
import { mapPaginatedObjectMetadataItemsToObjectMetadataItems } from '@/object-metadata/utils/mapPaginatedObjectMetadataItemsToObjectMetadataItems';
import { type FetchPolicy, useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectMetadataItemsQuery } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useRefreshObjectMetadataItems = (
  fetchPolicy: FetchPolicy = 'cache-first',
) => {
  const client = useApolloClient();
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

  // Fetch metadata items and store them without permissions enrichment.
  // Used when user workspace data is not yet available.
  const fetchAndStoreRawObjectMetadataItems = async () => {
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

    return storeRawObjectMetadataItems(objectMetadataItems);
  };

  const storeRawObjectMetadataItems = useRecoilCallback(
    ({ set, snapshot }) =>
      (
        rawObjectMetadataItems: Omit<
          ObjectMetadataItem,
          'readableFields' | 'updatableFields'
        >[],
      ) => {
        // Store items with all fields as readable/updatable by default
        // Permissions will be applied later when user data is available
        const objectMetadataItems: ObjectMetadataItem[] =
          rawObjectMetadataItems.map((item) => ({
            ...item,
            readableFields: item.fields,
            updatableFields: item.fields,
          }));

        if (
          !isDeeplyEqual(
            snapshot.getLoadable(objectMetadataItemsState).getValue(),
            objectMetadataItems,
          ) &&
          objectMetadataItems.length > 0
        ) {
          set(objectMetadataItemsState, objectMetadataItems);
        }

        if (snapshot.getLoadable(shouldAppBeLoadingState).getValue() === true) {
          set(shouldAppBeLoadingState, false);
        }

        if (
          snapshot.getLoadable(isAppEffectRedirectEnabledState).getValue() ===
          false
        ) {
          set(isAppEffectRedirectEnabledState, true);
        }

        return objectMetadataItems;
      },
    [],
  );

  // Enrich already-stored metadata items with permissions from user workspace
  const enrichWithPermissions = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const currentUserWorkspace = snapshot
          .getLoadable(currentUserWorkspaceState)
          .getValue();

        if (!isDefined(currentUserWorkspace)) {
          return;
        }

        const currentItems = snapshot
          .getLoadable(objectMetadataItemsState)
          .getValue();

        if (currentItems.length === 0) {
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

        const enrichedItems = enrichObjectMetadataItemsWithPermissions({
          objectMetadataItems: currentItems,
          objectPermissionsByObjectMetadataId,
        });

        if (!isDeeplyEqual(currentItems, enrichedItems)) {
          set(objectMetadataItemsState, enrichedItems);
        }
      },
    [],
  );

  const replaceObjectMetadataItemIfDifferent = useRecoilCallback(
    ({ set, snapshot }) =>
      (
        toSetObjectMetadataItems: Omit<
          ObjectMetadataItem,
          'readableFields' | 'updatableFields'
        >[],
      ) => {
        const currentUserWorkspace = snapshot
          .getLoadable(currentUserWorkspaceState)
          .getValue();

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

        const newObjectMetadataItems = enrichObjectMetadataItemsWithPermissions(
          {
            objectMetadataItems: toSetObjectMetadataItems,
            objectPermissionsByObjectMetadataId,
          },
        );

        if (
          !isDeeplyEqual(
            snapshot.getLoadable(objectMetadataItemsState).getValue(),
            newObjectMetadataItems,
          ) &&
          newObjectMetadataItems.length > 0
        ) {
          set(objectMetadataItemsState, newObjectMetadataItems);
        }

        if (snapshot.getLoadable(shouldAppBeLoadingState).getValue() === true) {
          set(shouldAppBeLoadingState, false);
        }

        if (
          snapshot.getLoadable(isAppEffectRedirectEnabledState).getValue() ===
          false
        ) {
          set(isAppEffectRedirectEnabledState, true);
        }

        return newObjectMetadataItems;
      },
    [],
  );

  return {
    refreshObjectMetadataItems,
    fetchAndStoreRawObjectMetadataItems,
    enrichWithPermissions,
  };
};
