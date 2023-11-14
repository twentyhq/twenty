import { useApolloClient } from '@apollo/client';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useRecoilState, useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { Favorite } from '@/favorites/types/Favorite';
import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';

import { favoritesState } from '../states/favoritesState';

export const useFavorites = () => {
  const currentUser = useRecoilValue(currentUserState);
  const workspaceMemberId = currentUser?.workspaceMember?.id;

  const [favorites, setFavorites] = useRecoilState(favoritesState);

  const { updateOneMutation, createOneMutation, deleteOneMutation } =
    useFindOneObjectMetadataItem({
      objectNameSingular: 'favoriteV2',
    });

  const apolloClient = useApolloClient();

  const createFavorite = async (
    favoriteNameToCreate: string,
    favoriteIdToCreate: string,
  ) => {
    if (!favoriteNameToCreate || !favoriteIdToCreate) {
      return;
    }

    return await apolloClient.mutate({
      mutation: createOneMutation,
      variables: {
        input: {
          [`${favoriteNameToCreate}`]: favoriteIdToCreate,
          position: favorites.length + 1,
          workspaceMember: workspaceMemberId,
        },
      },
    });
  };

  const _updateFavoritePosition = async (
    favorite: Pick<Favorite, 'id' | 'position'>,
  ) => {
    apolloClient.mutate({
      mutation: updateOneMutation,
      variables: {
        data: {
          position: favorite?.position,
        },
        where: {
          id: favorite.id,
        },
      },
    });
  };

  const deleteFavorite = (
    favoriteNameToDelete: string,
    favoriteIdToDelete: string,
  ) => {
    apolloClient.mutate({
      mutation: deleteOneMutation,
      variables: {
        where: {
          [`${favoriteNameToDelete}`]: favoriteIdToDelete,
        },
      },
    });
  };

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
    createFavorite,
    deleteFavorite,
    handleReorderFavorite,
  };
};
