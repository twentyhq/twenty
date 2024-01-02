import { useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { GraphQLView } from '@/views/types/GraphQLView';
import { getViewScopedStateValuesFromSnapshot } from '@/views/utils/getViewScopedStateValuesFromSnapshot';

export const useViews = (scopeId: string) => {
  const {
    updateOneRecordMutation: updateOneMutation,
    createOneRecordMutation: createOneMutation,
    deleteOneRecordMutation: deleteOneMutation,
    findManyRecordsQuery: findManyQuery,
  } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.View,
  });

  const apolloClient = useApolloClient();

  const createView = useRecoilCallback(
    ({ snapshot }) =>
      async (view: Pick<GraphQLView, 'id' | 'name'>) => {
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
              id: view.id,
              name: view.name,
              objectMetadataId: viewObjectMetadataId,
              type: viewType,
            },
          },
          refetchQueries: [findManyQuery],
        });
      },
    [scopeId, apolloClient, createOneMutation, findManyQuery],
  );

  const updateView = async (view: GraphQLView) => {
    await apolloClient.mutate({
      mutation: updateOneMutation,
      variables: {
        idToUpdate: view.id,
        input: {
          id: view.id,
          name: view.name,
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
