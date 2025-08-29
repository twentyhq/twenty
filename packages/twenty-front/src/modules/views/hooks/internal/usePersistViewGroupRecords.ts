import { useCallback } from 'react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useDestroyManyRecords } from '@/object-record/hooks/useDestroyManyRecords';
import { useUpdateOneRecordMutation } from '@/object-record/hooks/useUpdateOneRecordMutation';
import { CREATE_CORE_VIEW_GROUP } from '@/views/graphql/mutations/createCoreViewGroup';
import { DESTROY_CORE_VIEW_GROUP } from '@/views/graphql/mutations/destroyCoreViewGroup';
import { UPDATE_CORE_VIEW_GROUP } from '@/views/graphql/mutations/updateCoreViewGroup';
import { type ViewGroup } from '@/views/types/ViewGroup';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { useApolloClient } from '@apollo/client';
import { FeatureFlagKey } from '~/generated/graphql';

type CreateViewGroupRecordsArgs = {
  viewGroupsToCreate: ViewGroup[];
  viewId: string;
};

export const usePersistViewGroupRecords = () => {
  const featureFlags = useFeatureFlagsMap();
  const isCoreViewEnabled = featureFlags[FeatureFlagKey.IS_CORE_VIEW_ENABLED];

  const apolloCoreClient = useApolloCoreClient();
  const apolloClient = useApolloClient();

  const { createManyRecords } = useCreateManyRecords({
    objectNameSingular: CoreObjectNameSingular.ViewGroup,
    shouldMatchRootQueryFilter: true,
  });

  const { updateOneRecordMutation } = useUpdateOneRecordMutation({
    objectNameSingular: CoreObjectNameSingular.ViewGroup,
  });

  const { destroyManyRecords } = useDestroyManyRecords({
    objectNameSingular: CoreObjectNameSingular.ViewGroup,
  });

  const createViewGroupRecords = useCallback(
    ({ viewGroupsToCreate, viewId }: CreateViewGroupRecordsArgs) => {
      if (viewGroupsToCreate.length === 0) return;

      return createManyRecords({
        recordsToCreate: viewGroupsToCreate.map((viewGroup) => ({
          ...viewGroup,
          viewId,
        })),
      });
    },
    [createManyRecords],
  );

  const updateViewGroupRecords = useCallback(
    async (viewGroupsToUpdate: ViewGroup[]) => {
      if (!viewGroupsToUpdate.length) return;

      const mutationPromises = viewGroupsToUpdate.map((viewGroup) =>
        apolloCoreClient.mutate<{ updateViewGroup: ViewGroup }>({
          mutation: updateOneRecordMutation,
          variables: {
            id: viewGroup.id,
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

      // FixMe: Using useUpdateOneRecord hook that call triggerUpdateRecordsOptimisticEffect is actaully causing multiple records to be created
      // This is a temporary fix
      mutationResults.forEach(({ data }) => {
        const record = data?.['updateViewGroup'];

        if (!record) return;

        apolloCoreClient.cache.modify({
          id: apolloCoreClient.cache.identify({
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
    [apolloCoreClient, updateOneRecordMutation],
  );

  const deleteViewGroupRecords = useCallback(
    async (viewGroupsToDelete: ViewGroup[]) => {
      if (!viewGroupsToDelete.length) return;

      const recordIdsToDestroy = viewGroupsToDelete.map(
        (viewGroup) => viewGroup.id,
      );
      return destroyManyRecords({
        recordIdsToDestroy,
      });
    },
    [destroyManyRecords],
  );

  const createCoreViewGroupRecords = useCallback(
    ({ viewGroupsToCreate, viewId }: CreateViewGroupRecordsArgs) => {
      if (viewGroupsToCreate.length === 0) return;

      return Promise.all(
        viewGroupsToCreate.map((viewGroup) =>
          apolloClient.mutate({
            mutation: CREATE_CORE_VIEW_GROUP,
            variables: {
              input: {
                id: viewGroup.id,
                viewId,
                fieldMetadataId: viewGroup.fieldMetadataId,
                fieldValue: viewGroup.fieldValue,
                isVisible: viewGroup.isVisible,
                position: viewGroup.position,
              },
            },
          }),
        ),
      );
    },
    [apolloClient],
  );

  const updateCoreViewGroupRecords = useCallback(
    async (viewGroupsToUpdate: ViewGroup[]) => {
      if (!viewGroupsToUpdate.length) return;

      const mutationPromises = viewGroupsToUpdate.map((viewGroup) =>
        apolloClient.mutate<{ updateCoreViewGroup: ViewGroup }>({
          mutation: UPDATE_CORE_VIEW_GROUP,
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

      // FixMe: Using useUpdateOneRecord hook that call triggerUpdateRecordsOptimisticEffect is actaully causing multiple records to be created
      // This is a temporary fix
      mutationResults.forEach(({ data }) => {
        const record = data?.['updateCoreViewGroup'];

        if (!record) return;

        apolloClient.cache.modify({
          id: apolloClient.cache.identify({
            __typename: 'CoreViewGroup',
            id: record.id,
          }),
          fields: {
            isVisible: () => record.isVisible,
            position: () => record.position,
          },
        });
      });
    },
    [apolloClient],
  );

  const deleteCoreViewGroupRecords = useCallback(
    async (viewGroupsToDelete: ViewGroup[]) => {
      if (!viewGroupsToDelete.length) return;

      return Promise.all(
        viewGroupsToDelete.map((viewGroup) =>
          apolloClient.mutate({
            mutation: DESTROY_CORE_VIEW_GROUP,
            variables: {
              id: viewGroup.id,
            },
          }),
        ),
      );
    },
    [apolloClient],
  );

  return {
    createViewGroupRecords: isCoreViewEnabled
      ? createCoreViewGroupRecords
      : createViewGroupRecords,
    updateViewGroupRecords: isCoreViewEnabled
      ? updateCoreViewGroupRecords
      : updateViewGroupRecords,
    deleteViewGroupRecords: isCoreViewEnabled
      ? deleteCoreViewGroupRecords
      : deleteViewGroupRecords,
  };
};
