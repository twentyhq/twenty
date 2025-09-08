import { type Favorite } from '@/favorites/types/Favorite';
import { getObjectMetadataNamePluralFromViewId } from '@/favorites/utils/getObjectMetadataNamePluralFromViewId';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';
import { type View } from '@/views/types/View';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

export type ProcessedFavorite = Favorite & {
  Icon?: string;
  objectNameSingular: string;
};

export const sortFavorites = (
  favorites: Favorite[],
  favoriteRelationFieldMetadataItems: FieldMetadataItem[],
  getObjectRecordIdentifierByNameSingular: (
    record: ObjectRecord,
    objectNameSingular: string,
  ) => ObjectRecordIdentifier,
  hasLinkToShowPage: boolean,
  views: Pick<View, 'id' | 'name' | 'objectMetadataId' | 'icon'>[],
  objectMetadataItems: ObjectMetadataItem[],
): ProcessedFavorite[] => {
  return favorites
    .map((favorite) => {
      if (isDefined(favorite.viewId)) {
        const view = views.find((view) => view.id === favorite.viewId);

        if (!isDefined(view)) {
          return {
            ...favorite,
            objectNameSingular: 'view',
          };
        }

        const { namePlural } = getObjectMetadataNamePluralFromViewId(
          view,
          objectMetadataItems,
        );

        return {
          __typename: 'Favorite',
          id: favorite.id,
          recordId: view?.id,
          position: favorite.position,
          avatarType: 'icon',
          avatarUrl: '',
          labelIdentifier: view?.name,
          link: getAppPath(
            AppPath.RecordIndexPage,
            { objectNamePlural: namePlural },
            favorite.viewId ? { viewId: favorite.viewId } : undefined,
          ),
          forWorkspaceMemberId: favorite.forWorkspaceMemberId,
          favoriteFolderId: favorite.favoriteFolderId,
          objectNameSingular: 'view',
          Icon: view?.icon,
        } as ProcessedFavorite;
      }

      for (const relationField of favoriteRelationFieldMetadataItems) {
        if (isDefined(favorite[relationField.name])) {
          const relationObject = favorite[relationField.name];

          const objectNameSingular =
            relationField.relation?.targetObjectMetadata.nameSingular ?? '';

          const objectRecordIdentifier =
            getObjectRecordIdentifierByNameSingular(
              relationObject,
              objectNameSingular,
            );

          return {
            __typename: 'Favorite',
            id: favorite.id,
            recordId: objectRecordIdentifier.id,
            position: favorite.position,
            avatarType: objectRecordIdentifier.avatarType,
            avatarUrl: objectRecordIdentifier.avatarUrl,
            labelIdentifier: objectRecordIdentifier.name,
            link: hasLinkToShowPage
              ? objectRecordIdentifier.linkToShowPage
              : '',
            forWorkspaceMemberId: favorite.forWorkspaceMemberId,
            favoriteFolderId: favorite.favoriteFolderId,
            objectNameSingular: objectNameSingular,
          } as ProcessedFavorite;
        }
      }
      return null;
    })
    .filter(isDefined)
    .sort((a, b) => a.position - b.position);
};
