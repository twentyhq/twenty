import { sortFavorites } from '@/favorites/utils/sortFavorites';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useGetObjectRecordIdentifierByNameSingular } from '@/object-metadata/hooks/useGetObjectRecordIdentifierByNameSingular';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { prefetchViewsState } from '@/prefetch/states/prefetchViewsState';
import { coreViewsState } from '@/views/states/coreViewState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import {
  FeatureFlagKey,
  FieldMetadataType,
} from '~/generated-metadata/graphql';
import { usePrefetchedFavoritesData } from './usePrefetchedFavoritesData';

export const useWorkspaceFavorites = () => {
  const { workspaceFavorites } = usePrefetchedFavoritesData();
  const isCoreViewEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CORE_VIEW_ENABLED,
  );
  const prefetchViews = useRecoilValue(prefetchViewsState);
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

  const views = isCoreViewEnabled ? coreViews : prefetchViews;

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
    workspaceFavorites: sortedWorkspaceFavorites,
    workspaceFavoritesObjectMetadataItems:
      activeNonSystemObjectMetadataItemsInWorkspaceFavorites,
  };
};
