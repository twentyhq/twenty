import { useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';

import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { View } from '@/views/types/View';
import { getViewScopedStateValuesFromSnapshot } from '@/views/utils/getViewScopedStateValuesFromSnapshot';

export const useViews = (scopeId: string) => {
  const {
    updateOneMutation,
    createOneMutation,
    deleteOneMutation,
    findManyQuery,
  } = useFindOneObjectMetadataItem({
    objectNameSingular: 'viewV2',
  });
  const apolloClient = useApolloClient();

  const createView = useRecoilCallback(
    ({ snapshot }) =>
      async (view: Pick<View, 'id' | 'name'>) => {
        const { viewObjectMetadataId, viewType } =
          getViewScopedStateValuesFromSnapshot({
            snapshot,
            viewScopeId: scopeId,
          });

        if (!viewObjectMetadataId || !viewType) {
          return;
        }
        await apolloClient.mutate({
          mutation: createOneMutation,
          variables: {
            input: {
              ...view,
              objectMetadataId: viewObjectMetadataId,
              type: viewType,
            },
          },
          refetchQueries: [findManyQuery],
        });
      },
    [scopeId, apolloClient, createOneMutation, findManyQuery],
  );

  const updateView = async (view: View) => {
    await apolloClient.mutate({
      mutation: updateOneMutation,
      variables: {
        idToUpdate: view.id,
        input: {
          ...view,
        },
      },
      refetchQueries: [findManyQuery],
    });
  };

  const deleteView = async (viewId: string) => {
    await apolloClient.mutate({
      mutation: deleteOneMutation,
      variables: {
        idToDelete: viewId,
      },
      refetchQueries: [findManyQuery],
    });
  };

  return {
    createView,
    deleteView,
    isFetchingViews: false,
    updateView,
  };
};
