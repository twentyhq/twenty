import { useCallback } from 'react';
import { v4 } from 'uuid';

import { CREATE_CORE_VIEW_FIELD } from '@/views/graphql/mutations/createCoreViewField';
import { UPDATE_CORE_VIEW_FIELD } from '@/views/graphql/mutations/updateCoreViewField';
import { useTriggerViewFieldOptimisticEffect } from '@/views/optimistic-effects/hooks/useTriggerViewFieldOptimisticEffect';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { type ViewField } from '@/views/types/ViewField';
import { useApolloClient } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';
import { UpdateViewFieldInput, type CoreViewField } from '~/generated/graphql';

export const usePersistViewFieldRecords = () => {
  const apolloClient = useApolloClient();

  const { triggerViewFieldOptimisticEffect } =
    useTriggerViewFieldOptimisticEffect();

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
            update: (_cache, { data }) => {
              const record = data?.['createCoreViewField'];
              if (!record) return;

              triggerViewFieldOptimisticEffect({
                createdViewFields: [record],
              });
            },
          }),
        ),
      );
    },
    [apolloClient, triggerViewFieldOptimisticEffect],
  );

  const updateCoreViewFieldRecords = useCallback(
    (viewFieldsToUpdate: Omit<ViewField, 'definition'>[]) => {
      if (!viewFieldsToUpdate.length) return;

      return Promise.all(
        viewFieldsToUpdate.map((viewField) =>
          apolloClient.mutate<any, { input: UpdateViewFieldInput }>({
            mutation: UPDATE_CORE_VIEW_FIELD,
            variables: {
              input: {
                id: viewField.id,
                update: {
                  isVisible: viewField.isVisible,
                  position: viewField.position,
                  size: viewField.size,
                  aggregateOperation: viewField.aggregateOperation,
                },
              },
            },
            update: (_cache, { data }) => {
              const record = data?.['updateCoreViewField'];
              if (!isDefined(record)) return;

              triggerViewFieldOptimisticEffect({
                updatedViewFields: [record],
              });
            },
          }),
        ),
      );
    },
    [apolloClient, triggerViewFieldOptimisticEffect],
  );

  return {
    createViewFieldRecords: createCoreViewFieldRecords,
    updateViewFieldRecords: updateCoreViewFieldRecords,
  };
};
