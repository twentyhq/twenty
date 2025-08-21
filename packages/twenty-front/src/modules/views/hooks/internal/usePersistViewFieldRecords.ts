import { useCallback } from 'react';
import { v4 } from 'uuid';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { useCreateOneRecordMutation } from '@/object-record/hooks/useCreateOneRecordMutation';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpdateOneRecordMutation } from '@/object-record/hooks/useUpdateOneRecordMutation';
import { CREATE_CORE_VIEW_FIELD } from '@/views/graphql/mutations/createCoreViewField';
import { UPDATE_CORE_VIEW_FIELD } from '@/views/graphql/mutations/updateCoreViewField';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { type ViewField } from '@/views/types/ViewField';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { useApolloClient } from '@apollo/client';
import { isNull } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey, type CoreViewField } from '~/generated/graphql';

export const usePersistViewFieldRecords = () => {
  const featureFlags = useFeatureFlagsMap();
  const isCoreViewEnabled = featureFlags[FeatureFlagKey.IS_CORE_VIEW_ENABLED];

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.ViewField,
  });

  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.ViewField,
  });

  const { createOneRecordMutation } = useCreateOneRecordMutation({
    objectNameSingular: CoreObjectNameSingular.ViewField,
  });

  const { updateOneRecordMutation } = useUpdateOneRecordMutation({
    objectNameSingular: CoreObjectNameSingular.ViewField,
  });

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const apolloCoreClient = useApolloCoreClient();
  const apolloClient = useApolloClient();

  const createViewFieldRecords = useCallback(
    (
      viewFieldsToCreate: Omit<ViewField, 'definition'>[],
      view: Pick<GraphQLView, 'id'>,
    ) => {
      if (!viewFieldsToCreate.length) return;
      return Promise.all(
        viewFieldsToCreate.map((viewField) =>
          apolloCoreClient.mutate({
            mutation: createOneRecordMutation,
            variables: {
              input: {
                fieldMetadataId: viewField.fieldMetadataId,
                viewId: view.id,
                isVisible: viewField.isVisible,
                position: viewField.position,
                size: viewField.size,
                id: v4(),
              },
            },
            update: (cache, { data }) => {
              const record = data?.['createViewField'];
              if (!record) return;

              triggerCreateRecordsOptimisticEffect({
                cache,
                objectMetadataItem,
                recordsToCreate: [record],
                objectMetadataItems,
                objectPermissionsByObjectMetadataId,
              });
            },
          }),
        ),
      );
    },
    [
      apolloCoreClient,
      createOneRecordMutation,
      objectMetadataItem,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
    ],
  );

  const updateViewFieldRecords = useCallback(
    (viewFieldsToUpdate: Omit<ViewField, 'definition'>[]) => {
      if (!viewFieldsToUpdate.length) return;

      return Promise.all(
        viewFieldsToUpdate.map((viewField) =>
          apolloCoreClient.mutate({
            mutation: updateOneRecordMutation,
            variables: {
              idToUpdate: viewField.id,
              input: {
                isVisible: viewField.isVisible,
                position: viewField.position,
                size: viewField.size,
                aggregateOperation: viewField.aggregateOperation,
              },
            },
            update: (cache, { data }) => {
              const record = data?.['updateViewField'];
              if (!isDefined(record)) return;

              const cachedRecord = getRecordFromCache<ViewField>(
                record.id,
                cache,
              );
              if (isNull(cachedRecord)) return;

              triggerUpdateRecordOptimisticEffect({
                cache,
                objectMetadataItem,
                currentRecord: cachedRecord,
                updatedRecord: record,
                objectMetadataItems,
              });
            },
          }),
        ),
      );
    },
    [
      apolloCoreClient,
      getRecordFromCache,
      objectMetadataItem,
      objectMetadataItems,
      updateOneRecordMutation,
    ],
  );

  const createCoreViewFieldRecords = useCallback(
    (
      viewFieldsToCreate: Omit<ViewField, 'definition'>[],
      view: Pick<GraphQLView, 'id'>,
    ) => {
      if (!viewFieldsToCreate.length) return;
      return Promise.all(
        viewFieldsToCreate.map((viewField) =>
          apolloClient.mutate({
            mutation: CREATE_CORE_VIEW_FIELD,
            variables: {
              input: {
                fieldMetadataId: viewField.fieldMetadataId,
                viewId: view.id,
                isVisible: viewField.isVisible,
                position: viewField.position,
                size: viewField.size,
              } satisfies Partial<CoreViewField>,
            },
            update: (cache, { data }) => {
              const record = data?.['createCoreViewField'];
              if (!record) return;

              triggerCreateRecordsOptimisticEffect({
                cache,
                objectMetadataItem,
                recordsToCreate: [record],
                objectMetadataItems,
                objectPermissionsByObjectMetadataId,
              });
            },
          }),
        ),
      );
    },
    [
      apolloClient,
      objectMetadataItem,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
    ],
  );

  const updateCoreViewFieldRecords = useCallback(
    (viewFieldsToUpdate: Omit<ViewField, 'definition'>[]) => {
      if (!viewFieldsToUpdate.length) return;

      return Promise.all(
        viewFieldsToUpdate.map((viewField) =>
          apolloClient.mutate({
            mutation: UPDATE_CORE_VIEW_FIELD,
            variables: {
              idToUpdate: viewField.id,
              input: {
                isVisible: viewField.isVisible,
                position: viewField.position,
                size: viewField.size,
                aggregateOperation: viewField.aggregateOperation,
              } satisfies Partial<CoreViewField>,
            },
            update: (cache, { data }) => {
              const record = data?.['updateCoreViewField'];
              if (!isDefined(record)) return;

              const cachedRecord = getRecordFromCache<ViewField>(
                record.id,
                cache,
              );
              if (isNull(cachedRecord)) return;

              triggerUpdateRecordOptimisticEffect({
                cache,
                objectMetadataItem,
                currentRecord: cachedRecord,
                updatedRecord: record,
                objectMetadataItems,
              });
            },
          }),
        ),
      );
    },
    [apolloClient, getRecordFromCache, objectMetadataItem, objectMetadataItems],
  );

  return {
    createViewFieldRecords: isCoreViewEnabled
      ? createCoreViewFieldRecords
      : createViewFieldRecords,
    updateViewFieldRecords: isCoreViewEnabled
      ? updateCoreViewFieldRecords
      : updateViewFieldRecords,
  };
};
