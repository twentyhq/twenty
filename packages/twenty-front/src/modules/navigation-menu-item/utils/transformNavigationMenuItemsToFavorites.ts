// TODO: Remove this transformer once Favorite type is fully deprecated
// This requires refactoring all components to use NavigationMenuItem directly
// and compute display fields (labelIdentifier, avatarUrl, link, avatarType) on-the-fly
// from targetRecordId + targetObjectMetadataId instead of using the Favorite type.
// Affected files: usePrefetchedFavoritesData, sortFavorites, FavoriteIcon, and all
// components in the favorites module that currently use Favorite type.

import { type Favorite } from '@/favorites/types/Favorite';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useTransformNavigationMenuItemsToFavorites = (
  navigationMenuItems: NavigationMenuItem[],
): Favorite[] => {
  const apolloCoreClient = useApolloCoreClient();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const favorites = useMemo(() => {
    return navigationMenuItems
      .map((navigationMenuItem) => {
        const objectMetadataItem = objectMetadataItems.find(
          (item) => item.id === navigationMenuItem.targetObjectMetadataId,
        );

        if (!isDefined(objectMetadataItem)) {
          return null;
        }

        const recordGqlFields = generateDepthRecordGqlFieldsFromObject({
          objectMetadataItem,
          depth: 1,
          objectMetadataItems,
        });

        const targetRecord = getRecordFromCache<ObjectRecord>({
          cache: apolloCoreClient.cache,
          recordId: navigationMenuItem.targetRecordId,
          objectMetadataItems,
          objectMetadataItem,
          recordGqlFields,
          objectPermissionsByObjectMetadataId,
        });

        if (!isDefined(targetRecord)) {
          return null;
        }

        const favorite: Favorite = {
          id: navigationMenuItem.id,
          position: navigationMenuItem.position,
          forWorkspaceMemberId: navigationMenuItem.userWorkspaceId ?? '',
          favoriteFolderId: navigationMenuItem.folderId ?? undefined,
          recordId: navigationMenuItem.targetRecordId,
          __typename: 'Favorite',
          [`${objectMetadataItem.nameSingular}Id`]:
            navigationMenuItem.targetRecordId,
          [objectMetadataItem.nameSingular]: targetRecord,
        } as Favorite;

        return favorite;
      })
      .filter(isDefined);
  }, [
    navigationMenuItems,
    objectMetadataItems,
    apolloCoreClient.cache,
    objectPermissionsByObjectMetadataId,
  ]);

  return favorites;
};
