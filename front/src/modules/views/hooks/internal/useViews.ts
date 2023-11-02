import { useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';

import { useFindOneObjectMetadataItem } from '@/metadata/hooks/useFindOneObjectMetadataItem';
import { viewObjectIdScopeState } from '@/views/states/viewObjectIdScopeState';
import { viewTypeScopedState } from '@/views/states/viewTypeScopedState';
import { View } from '@/views/types/View';

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
        const viewObjectId = await snapshot
          .getLoadable(viewObjectIdScopeState({ scopeId }))
          .getValue();

        const viewType = await snapshot
          .getLoadable(viewTypeScopedState({ scopeId }))
          .getValue();

        if (!viewObjectId || !viewType) {
          return;
        }
        await apolloClient.mutate({
          mutation: createOneMutation,
          variables: {
            input: {
              ...view,
              objectId: viewObjectId,
              type: viewType,
            },
          },
          refetchQueries: [findManyQuery],
        });
      },
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
