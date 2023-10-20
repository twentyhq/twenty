import { getOperationName } from '@apollo/client/utilities';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useRecoilState } from 'recoil';

import { GET_COMPANY } from '@/companies/graphql/queries/getCompany';
import { GET_PERSON } from '@/people/graphql/queries/getPerson';
import {
  Favorite,
  useDeleteFavoriteMutation,
  useInsertCompanyFavoriteMutation,
  useInsertPersonFavoriteMutation,
  useUpdateOneFavoriteMutation,
} from '~/generated/graphql';

import { GET_FAVORITES } from '../graphql/queries/getFavorites';
import { favoritesState } from '../states/favoritesState';

export const useFavorites = () => {
  const [favorites, setFavorites] = useRecoilState(favoritesState);

  const [insertCompanyFavoriteMutation] = useInsertCompanyFavoriteMutation();
  const [insertPersonFavoriteMutation] = useInsertPersonFavoriteMutation();
  const [deleteFavoriteMutation] = useDeleteFavoriteMutation();
  const [updateOneFavoritesMutation] = useUpdateOneFavoriteMutation();

  const insertCompanyFavorite = (companyId: string) => {
    insertCompanyFavoriteMutation({
      variables: {
        data: {
          companyId,
          position: favorites.length + 1,
        },
      },
      refetchQueries: [
        getOperationName(GET_FAVORITES) ?? '',
        getOperationName(GET_COMPANY) ?? '',
      ],
    });
  };

  const insertPersonFavorite = (personId: string) => {
    insertPersonFavoriteMutation({
      variables: {
        data: {
          personId,
          position: favorites.length + 1,
        },
      },
      refetchQueries: [
        getOperationName(GET_FAVORITES) ?? '',
        getOperationName(GET_PERSON) ?? '',
      ],
    });
  };

  const updateFavoritePosition = async (
    favorites: Pick<Favorite, 'id' | 'position'>,
  ) => {
    await updateOneFavoritesMutation({
      variables: {
        data: {
          position: favorites?.position,
        },
        where: {
          id: favorites.id,
        },
      },
      refetchQueries: [
        getOperationName(GET_FAVORITES) ?? '',
        getOperationName(GET_PERSON) ?? '',
        getOperationName(GET_COMPANY) ?? '',
      ],
    });
  };
  const deleteCompanyFavorite = (companyId: string) => {
    deleteFavoriteMutation({
      variables: {
        where: {
          companyId: {
            equals: companyId,
          },
        },
      },
      refetchQueries: [
        getOperationName(GET_FAVORITES) ?? '',
        getOperationName(GET_COMPANY) ?? '',
      ],
    });
  };

  const deletePersonFavorite = (personId: string) => {
    deleteFavoriteMutation({
      variables: {
        where: {
          personId: {
            equals: personId,
          },
        },
      },
      refetchQueries: [
        getOperationName(GET_FAVORITES) ?? '',
        getOperationName(GET_PERSON) ?? '',
      ],
    });
  };

  const computeNewPosition = (destIndex: number, sourceIndex: number) => {
    if (destIndex === 0) {
      return favorites[destIndex].position / 2;
    }

    if (destIndex === favorites.length - 1) {
      return favorites[destIndex].position + 1;
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
    updateFavoritePosition(removedFav);
  };
  return {
    insertCompanyFavorite,
    insertPersonFavorite,
    deleteCompanyFavorite,
    deletePersonFavorite,
    handleReorderFavorite,
  };
};
