import { useCallback } from 'react';
import { v4 } from 'uuid';

import { triggerCreateRecordsOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerCreateRecordsOptimisticEffect';
import { triggerUpdateRecordOptimisticEffect } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { CREATE_CORE_VIEW_FIELD } from '@/views/graphql/mutations/createCoreViewField';
import { UPDATE_CORE_VIEW_FIELD } from '@/views/graphql/mutations/updateCoreViewField';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { type ViewField } from '@/views/types/ViewField';
import { useApolloClient } from '@apollo/client';
import { isNull } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { type CoreViewField } from '~/generated/graphql';

export const usePersistViewFieldRecords = () => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.ViewField,
  });

  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.ViewField,
  });

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const apolloClient = useApolloClient();

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
                id: v4(),
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
              id: viewField.id,
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
    createViewFieldRecords: createCoreViewFieldRecords,
    updateViewFieldRecords: updateCoreViewFieldRecords,
  };
};
