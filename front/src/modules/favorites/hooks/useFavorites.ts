import { useApolloClient } from '@apollo/client';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { useOptimisticEvict } from '@/apollo/optimistic-effect/hooks/useOptimisticEvict';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { Favorite } from '@/favorites/types/Favorite';
import { mapFavorites } from '@/favorites/utils/mapFavorites';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { getRecordOptimisticEffectDefinition } from '@/object-record/graphql/optimistic-effect-definition/getRecordOptimisticEffectDefinition';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { PaginatedRecordTypeResults } from '@/object-record/types/PaginatedRecordTypeResults';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { favoritesState } from '../states/favoritesState';

export const useFavorites = ({
  objectNamePlural,
}: {
  objectNamePlural: string;
}) => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const [favorites, setFavorites] = useRecoilState(favoritesState);

  const {
    updateOneRecordMutation: updateOneFavoriteMutation,
    createOneRecordMutation: createOneFavoriteMutation,
    deleteOneRecordMutation: deleteOneFavoriteMutation,
    objectMetadataItem: favoriteObjectMetadataItem,
  } = useObjectMetadataItem({
    objectNameSingular: 'favorite',
  });

  const { registerOptimisticEffect, triggerOptimisticEffects } =
    useOptimisticEffect({
      objectNameSingular: 'favorite',
    });
  const { performOptimisticEvict } = useOptimisticEvict();

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });

  const { objectMetadataItem: favoriteTargetObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular,
    });

  const apolloClient = useApolloClient();

  useFindManyRecords({
    objectNameSingular: 'favorite',
    onCompleted: useRecoilCallback(
      ({ snapshot, set }) =>
        async (data: PaginatedRecordTypeResults<Required<Favorite>>) => {
          const favorites = snapshot.getLoadable(favoritesState).getValue();

          const queriedFavorites = mapFavorites(
            data.edges.map((edge) => edge.node),
          );

          if (!isDeeplyEqual(favorites, queriedFavorites)) {
            set(favoritesState, queriedFavorites);
          }

          if (!favoriteObjectMetadataItem) {
            return;
          }

          registerOptimisticEffect({
            variables: { filter: {}, orderBy: {} },
            definition: getRecordOptimisticEffectDefinition({
              objectMetadataItem: favoriteObjectMetadataItem,
            }),
          });
        },
      [favoriteObjectMetadataItem, registerOptimisticEffect],
    ),
  });

  const createFavorite = useRecoilCallback(
    ({ snapshot, set }) =>
      async (favoriteTargetObjectId: string, additionalData?: any) => {
        const favorites = snapshot.getLoadable(favoritesState).getValue();

        if (!favoriteTargetObjectMetadataItem) {
          return;
        }
        const targetObjectName = favoriteTargetObjectMetadataItem.nameSingular;

        const result = await apolloClient.mutate({
          mutation: createOneFavoriteMutation,
          variables: {
            input: {
              [`${targetObjectName}Id`]: favoriteTargetObjectId,
              position: favorites.length + 1,
              workspaceMemberId: currentWorkspaceMember?.id,
            },
          },
        });

        triggerOptimisticEffects(`FavoriteEdge`, result.data[`createFavorite`]);

        const createdFavorite = result?.data?.createFavorite;

        const newFavorite = {
          ...additionalData,
          ...createdFavorite,
        };

        const newFavoritesMapped = mapFavorites([newFavorite]);

        if (createdFavorite) {
          set(favoritesState, [...favorites, ...newFavoritesMapped]);
        }
      },
    [
      apolloClient,
      createOneFavoriteMutation,
      currentWorkspaceMember?.id,
      favoriteTargetObjectMetadataItem,
      triggerOptimisticEffects,
    ],
  );

  const _updateFavoritePosition = useRecoilCallback(
    ({ snapshot, set }) =>
      async (favoriteToUpdate: Favorite) => {
        const favoritesStateFromSnapshot = snapshot.getLoadable(favoritesState);
        const favorites = favoritesStateFromSnapshot.getValue();
        const result = await apolloClient.mutate({
          mutation: updateOneFavoriteMutation,
          variables: {
            input: {
              position: favoriteToUpdate?.position,
            },
            idToUpdate: favoriteToUpdate?.id,
          },
        });

        const updatedFavorite = result?.data?.updateFavoriteV2;
        if (updatedFavorite) {
          set(
            favoritesState,
            favorites.map((favorite: Favorite) =>
              favorite.id === updatedFavorite.id ? favoriteToUpdate : favorite,
            ),
          );
        }
      },
    [apolloClient, updateOneFavoriteMutation],
  );

  const deleteFavorite = useRecoilCallback(
    ({ snapshot, set }) =>
      async (favoriteIdToDelete: string) => {
        const favoritesStateFromSnapshot = snapshot.getLoadable(favoritesState);
        const favorites = favoritesStateFromSnapshot.getValue();
        const idToDelete = favorites.find(
          (favorite: Favorite) => favorite.recordId === favoriteIdToDelete,
        )?.id;

        await apolloClient.mutate({
          mutation: deleteOneFavoriteMutation,
          variables: {
            idToDelete: idToDelete,
          },
        });

        performOptimisticEvict('Favorite', 'id', idToDelete ?? '');

        set(
          favoritesState,
          favorites.filter((favorite: Favorite) => favorite.id !== idToDelete),
        );
      },
    [apolloClient, deleteOneFavoriteMutation, performOptimisticEvict],
  );

  const computeNewPosition = (destIndex: number, sourceIndex: number) => {
    if (destIndex === 0) {
      return favorites[destIndex].position / 2;
    }

    if (destIndex === favorites.length - 1) {
      return favorites[destIndex - 1].position + 1;
    }

    if (sourceIndex < destIndex) {
      return (
        (favorites[destIndex + 1].position + favorites[destIndex].position) / 2
      );
    }

    return (
      (favorites[destIndex - 1].position + favorites[destIndex].position) / 2
    );
  };

  const handleReorderFavorite: OnDragEndResponder = (result) => {
    if (!result.destination || !favorites) {
      return;
    }
    const newPosition = computeNewPosition(
      result.destination.index,
      result.source.index,
    );

    const reorderFavorites = Array.from(favorites);
    const [removed] = reorderFavorites.splice(result.source.index, 1);
    const removedFav = { ...removed, position: newPosition };
    reorderFavorites.splice(result.destination.index, 0, removedFav);
    setFavorites(reorderFavorites);
    _updateFavoritePosition(removedFav);
  };
  return {
    favorites,
    createFavorite,
    deleteFavorite,
    handleReorderFavorite,
  };
};
