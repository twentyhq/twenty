import { useApolloClient } from '@apollo/client';
import { useCallback } from 'react';
import { v4 } from 'uuid';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecordMutation } from '@/object-record/hooks/useCreateOneRecordMutation';
import { useDeleteOneRecordMutation } from '@/object-record/hooks/useDeleteOneRecordMutation';
import { useUpdateOneRecordMutation } from '@/object-record/hooks/useUpdateOneRecordMutation';
import { GraphQLView } from '@/views/types/GraphQLView';
import { ViewGroup } from '@/views/types/ViewGroup';

export const usePersistViewGroupRecords = () => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.ViewGroup,
  });

  const { createOneRecordMutation } = useCreateOneRecordMutation({
    objectNameSingular: CoreObjectNameSingular.ViewGroup,
  });

  const { updateOneRecordMutation } = useUpdateOneRecordMutation({
    objectNameSingular: CoreObjectNameSingular.ViewGroup,
  });

  const { deleteOneRecordMutation } = useDeleteOneRecordMutation({
    objectNameSingular: CoreObjectNameSingular.ViewGroup,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  const apolloClient = useApolloClient();

  const createViewGroupRecords = useCallback(
    (viewGroupsToCreate: ViewGroup[], view: GraphQLView) => {
      if (!viewGroupsToCreate.length) return;

      return Promise.all(
        viewGroupsToCreate.map((viewGroup) =>
          apolloClient.mutate({
            mutation: createOneRecordMutation,
            variables: {
              input: {
                fieldMetadataId: viewGroup.fieldMetadataId,
                viewId: view.id,
                isVisible: viewGroup.isVisible,
                position: viewGroup.position,
                id: v4(),
                fieldValue: viewGroup.fieldValue,
              },
            },
            update: (cache, { data }) => {
              const record = data?.['createViewGroup'];
              if (!record) return;

              triggerCreateRecordsOptimisticEffect({
                cache,
                objectMetadataItem,
                recordsToCreate: [record],
                objectMetadataItems,
              });
            },
          }),
        ),
      );
    },
    [
      apolloClient,
      createOneRecordMutation,
      objectMetadataItem,
      objectMetadataItems,
    ],
  );

  const updateViewGroupRecords = useCallback(
    async (viewGroupsToUpdate: ViewGroup[]) => {
      if (!viewGroupsToUpdate.length) return;

      const mutationPromises = viewGroupsToUpdate.map((viewGroup) =>
        apolloClient.mutate<{ updateViewGroup: ViewGroup }>({
          mutation: updateOneRecordMutation,
          variables: {
            idToUpdate: viewGroup.id,
            input: {
              isVisible: viewGroup.isVisible,
              position: viewGroup.position,
            },
          },
          // Avoid cache being updated with stale data
          fetchPolicy: 'no-cache',
        }),
      );

      const mutationResults = await Promise.all(mutationPromises);

      // FixMe: Using triggerCreateRecordsOptimisticEffect is actaully causing multiple records to be created
      mutationResults.forEach(({ data }) => {
        const record = data?.['updateViewGroup'];

        if (!record) return;

        apolloClient.cache.modify({
          id: apolloClient.cache.identify({
            __typename: 'ViewGroup',
            id: record.id,
          }),
          fields: {
            isVisible: () => record.isVisible,
            position: () => record.position,
          },
        });
      });
    },
    [apolloClient, updateOneRecordMutation],
  );

  const deleteViewGroupRecords = useCallback(
    async (viewGroupsToDelete: ViewGroup[]) => {
      if (!viewGroupsToDelete.length) return;

      const mutationPromises = viewGroupsToDelete.map((viewGroup) =>
        apolloClient.mutate<{ deleteViewGroup: ViewGroup }>({
          mutation: deleteOneRecordMutation,
          variables: {
            idToDelete: viewGroup.id,
          },
          // Avoid cache being updated with stale data
          fetchPolicy: 'no-cache',
        }),
      );

      const mutationResults = await Promise.all(mutationPromises);

      mutationResults.forEach(({ data }) => {
        const record = data?.['deleteViewGroup'];

        if (!record) return;

        apolloClient.cache.evict({
          id: apolloClient.cache.identify({
            __typename: 'ViewGroup',
            id: record.id,
          }),
        });
      });
    },
    [apolloClient, deleteOneRecordMutation],
  );

  return {
    createViewGroupRecords,
    updateViewGroupRecords,
    deleteViewGroupRecords,
  };
};
