import { useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { OnDragEndResponder } from '@hello-pangea/dnd';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { Favorite } from '@/favorites/types/Favorite';
import { mapFavorites } from '@/favorites/utils/mapFavorites';
import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { useFindManyObjectRecords } from '@/object-record/hooks/useFindManyObjectRecords';
import { PaginatedObjectTypeResults } from '@/object-record/types/PaginatedObjectTypeResults';
import { Company } from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { favoritesState } from '../states/favoritesState';

export const useFavorites = ({
  objectNamePlural,
}: {
  objectNamePlural: string | undefined;
}) => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const [favorites, setFavorites] = useRecoilState(favoritesState);

  const { updateOneMutation, createOneMutation, deleteOneMutation } =
    useFindOneObjectMetadataItem({
      objectNamePlural: 'favoritesV2',
    });

  const { foundObjectMetadataItem: favoriteTargetObjectMetadataItem } =
    useFindOneObjectMetadataItem({
      objectNamePlural,
    });

  const apolloClient = useApolloClient();

  const [allCompanies, setAllCompanies] = useState<
    Record<string, { name: string; domainName?: string }>
  >({});
  const [allPeople, setAllPeople] = useState<
    Record<string, { firstName: string; lastName: string; avatarUrl?: string }>
  >({});

  // This is only temporary and will be refactored once we have main identifiers
  const { loading: companiesLoading } = useFindManyObjectRecords({
    objectNamePlural: 'companiesV2',
    onCompleted: async (
      data: PaginatedObjectTypeResults<Required<Company>>,
    ) => {
      setAllCompanies(
        data.edges.reduce(
          (acc, { node: company }) => ({
            ...acc,
            [company.id]: {
              name: company.name,
              domainName: company.domainName,
            },
          }),
          {},
        ),
      );
    },
  });

  const { loading: peopleLoading } = useFindManyObjectRecords({
    objectNamePlural: 'peopleV2',
    onCompleted: async (data) => {
      setAllPeople(
        data.edges.reduce(
          (acc, { node: person }) => ({
            ...acc,
            [person.id]: {
              firstName: person.firstName,
              lastName: person.lastName,
              avatarUrl: person.avatarUrl,
            },
          }),
          {},
        ),
      );
    },
  });

  useFindManyObjectRecords({
    skip: companiesLoading || peopleLoading,
    objectNamePlural: 'favoritesV2',
    onCompleted: useRecoilCallback(
      ({ snapshot, set }) =>
        async (data: PaginatedObjectTypeResults<Required<Favorite>>) => {
          const favorites = snapshot.getLoadable(favoritesState).getValue();

          const queriedFavorites = mapFavorites(
            data.edges.map((edge) => edge.node),
            {
              ...allCompanies,
              ...allPeople,
            },
          );

          if (!isDeeplyEqual(favorites, queriedFavorites)) {
            set(favoritesState, queriedFavorites);
          }
        },
      [allCompanies, allPeople],
    ),
  });

  const createFavorite = useRecoilCallback(
    ({ snapshot, set }) =>
      async (favoriteTargetObjectId: string, additionalData?: any) => {
        const favorites = snapshot.getLoadable(favoritesState).getValue();

        const targetObjectName =
          favoriteTargetObjectMetadataItem?.nameSingular.replace('V2', '') ??
          '';

        const result = await apolloClient.mutate({
          mutation: createOneMutation,
          variables: {
            input: {
              [`${targetObjectName}Id`]: favoriteTargetObjectId,
              position: favorites.length + 1,
              workspaceMemberId: currentWorkspaceMember?.id,
            },
          },
        });

        const createdFavorite = result?.data?.createFavoriteV2;

        const newFavorite = {
          ...additionalData,
          ...createdFavorite,
        };

        const newFavoritesMapped = mapFavorites([newFavorite], {
          ...allCompanies,
          ...allPeople,
        });

        if (createdFavorite) {
          set(favoritesState, [...favorites, ...newFavoritesMapped]);
        }
      },
    [
      allCompanies,
      allPeople,
      apolloClient,
      createOneMutation,
      currentWorkspaceMember,
      favoriteTargetObjectMetadataItem?.nameSingular,
    ],
  );

  const _updateFavoritePosition = useRecoilCallback(
    ({ snapshot, set }) =>
      async (favoriteToUpdate: Favorite) => {
        const favoritesStateFromSnapshot = snapshot.getLoadable(favoritesState);
        const favorites = favoritesStateFromSnapshot.getValue();
        const result = await apolloClient.mutate({
          mutation: updateOneMutation,
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
    [apolloClient, updateOneMutation],
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
          mutation: deleteOneMutation,
          variables: {
            idToDelete: idToDelete,
          },
        });

        set(
          favoritesState,
          favorites.filter((favorite: Favorite) => favorite.id !== idToDelete),
        );
      },
    [apolloClient, deleteOneMutation],
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
