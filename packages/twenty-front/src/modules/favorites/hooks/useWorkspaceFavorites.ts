import { sortFavorites } from '@/favorites/utils/sortFavorites';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useGetObjectRecordIdentifierByNameSingular } from '@/object-metadata/hooks/useGetObjectRecordIdentifierByNameSingular';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import {
  FeatureFlagKey,
  FieldMetadataType,
} from '~/generated-metadata/graphql';
import { usePrefetchedFavoritesData } from './usePrefetchedFavoritesData';

export const useWorkspaceFavorites = () => {
  const featureFlags = useFeatureFlagsMap();
  const { workspaceFavorites } = usePrefetchedFavoritesData();
  const coreViews = useRecoilValue(coreViewsState);
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const { objectMetadataItem: favoriteObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Favorite,
    });
  const getObjectRecordIdentifierByNameSingular =
    useGetObjectRecordIdentifierByNameSingular();

  const favoriteRelationFieldMetadataItems = useMemo(
    () =>
      favoriteObjectMetadataItem.fields.filter(
        (fieldMetadataItem) =>
          fieldMetadataItem.type === FieldMetadataType.RELATION &&
          fieldMetadataItem.name !== 'forWorkspaceMember' &&
          fieldMetadataItem.name !== 'favoriteFolder',
      ),
    [favoriteObjectMetadataItem.fields],
  );

  const [dashboardObjectMetadataId] = objectMetadataItems
    .filter((item) => item.nameSingular === CoreObjectNameSingular.Dashboard)
    .map((item) => item.id);

  const views = coreViews
    .map(convertCoreViewToView)
    .filter(
      (view) =>
        featureFlags[FeatureFlagKey.IS_PAGE_LAYOUT_ENABLED] === true ||
        view.objectMetadataId !== dashboardObjectMetadataId,
    );

  const sortedWorkspaceFavorites = useMemo(
    () =>
      sortFavorites(
        workspaceFavorites.filter((favorite) => favorite.viewId),
        favoriteRelationFieldMetadataItems,
        getObjectRecordIdentifierByNameSingular,
        false,
        views,
        objectMetadataItems,
      ),
    [
      workspaceFavorites,
      favoriteRelationFieldMetadataItems,
      getObjectRecordIdentifierByNameSingular,
      views,
      objectMetadataItems,
    ],
  );

  const workspaceFavoriteIds = new Set(
    sortedWorkspaceFavorites.map((favorite) => favorite.recordId),
  );

  const favoriteViewObjectMetadataIds = new Set(
    views.reduce<string[]>((acc, view) => {
      if (workspaceFavoriteIds.has(view.id)) {
        acc.push(view.objectMetadataId);
      }
      return acc;
    }, []),
  );

  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const activeNonSystemObjectMetadataItemsInWorkspaceFavorites =
    activeNonSystemObjectMetadataItems.filter((item) =>
      favoriteViewObjectMetadataIds.has(item.id),
    );

  return {
    workspaceFavoritesObjectMetadataItems:
      activeNonSystemObjectMetadataItemsInWorkspaceFavorites,
  };
};
