// TODO: Remove this transformer once Favorite type is fully deprecated
// This requires refactoring all components to use NavigationMenuItem directly
// and compute display fields (labelIdentifier, avatarUrl, link, avatarType) on-the-fly
// from targetRecordId + targetObjectMetadataId instead of using the Favorite type.
// Affected files: usePrefetchedFavoritesData, sortFavorites, FavoriteIcon, and all
// components in the favorites module that currently use Favorite type.

import { type Favorite } from '@/favorites/types/Favorite';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const transformNavigationMenuItemToFavorite = (
  navigationMenuItem: NavigationMenuItem,
  targetRecord: ObjectRecord | null,
  objectMetadataItem: ObjectMetadataItem | null,
  objectRecordIdentifier: ObjectRecordIdentifier | null,
): Favorite | null => {
  if (!isDefined(targetRecord) || !isDefined(objectMetadataItem)) {
    return null;
  }

  const objectNameSingular = objectMetadataItem.nameSingular;

  const favorite: Favorite = {
    id: navigationMenuItem.id,
    position: navigationMenuItem.position,
    forWorkspaceMemberId: navigationMenuItem.forWorkspaceMemberId ?? '',
    favoriteFolderId: navigationMenuItem.favoriteFolderId ?? undefined,
    recordId: navigationMenuItem.targetRecordId,
    __typename: 'Favorite',
    [objectNameSingular]: targetRecord,
    [`${objectNameSingular}Id`]: navigationMenuItem.targetRecordId,
  } as Favorite;

  if (isDefined(objectRecordIdentifier)) {
    favorite.labelIdentifier = objectRecordIdentifier.name;
    favorite.avatarUrl = objectRecordIdentifier.avatarUrl ?? '';
    favorite.avatarType = objectRecordIdentifier.avatarType ?? 'icon';
    favorite.link = objectRecordIdentifier.linkToShowPage ?? '';
  }

  return favorite;
};
