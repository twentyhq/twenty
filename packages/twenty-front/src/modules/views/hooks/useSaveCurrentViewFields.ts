import { useStore } from 'jotai';
import { useCallback } from 'react';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { usePerformViewFieldAPIPersist } from '@/views/hooks/internal/usePerformViewFieldAPIPersist';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetViewFromPrefetchState } from '@/views/hooks/useGetViewFromPrefetchState';
import { type ViewField } from '@/views/types/ViewField';
import {
  type CreateViewFieldInput,
  type UpdateCoreViewFieldMutationVariables,
} from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useSaveCurrentViewFields = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const { performViewFieldAPICreate, performViewFieldAPIUpdate } =
    usePerformViewFieldAPIPersist();

  const { getViewFromPrefetchState } = useGetViewFromPrefetchState();

  const currentViewIdCallbackState = useRecoilComponentStateCallbackStateV2(
    contextStoreCurrentViewIdComponentState,
  );

  const store = useStore();

  const saveViewFields = useCallback(
    async (viewFieldsToSave: Omit<ViewField, 'definition'>[]) => {
      if (!canPersistChanges) {
        return;
      }

      const currentViewId = store.get(currentViewIdCallbackState);

      if (!currentViewId) {
        return;
      }

      const view = getViewFromPrefetchState(currentViewId);

      if (isUndefinedOrNull(view)) {
        return;
      }

      const currentViewFields = view.viewFields;

      const { viewFieldsToCreate, viewFieldsToUpdate } =
        viewFieldsToSave.reduce<{
          viewFieldsToCreate: CreateViewFieldInput[];
          viewFieldsToUpdate: UpdateCoreViewFieldMutationVariables[];
        }>(
          (
            { viewFieldsToCreate, viewFieldsToUpdate },
            { __typename, ...viewFieldToCreateOrUpdate },
          ) => {
            const createViewFieldInput: CreateViewFieldInput = {
              ...viewFieldToCreateOrUpdate,
              viewId: currentViewId,
            };
            const existingField = currentViewFields.find(
              (currentViewField) =>
                currentViewField.fieldMetadataId ===
                createViewFieldInput.fieldMetadataId,
            );

            if (isUndefinedOrNull(existingField)) {
              return {
                viewFieldsToCreate: [
                  ...viewFieldsToCreate,
                  createViewFieldInput,
                ],
                viewFieldsToUpdate,
              };
            }

            if (
              isDeeplyEqual(
                {
                  position: existingField.position,
                  size: existingField.size,
                  isVisible: existingField.isVisible,
                  aggregateOperation: existingField.aggregateOperation,
                },
                {
                  position: createViewFieldInput.position,
                  size: createViewFieldInput.size,
                  isVisible: createViewFieldInput.isVisible,
                  aggregateOperation: createViewFieldInput.aggregateOperation,
                },
              )
            ) {
              return {
                viewFieldsToCreate,
                viewFieldsToUpdate,
              };
            }

            return {
              viewFieldsToCreate,
              viewFieldsToUpdate: [
                ...viewFieldsToUpdate,
                {
                  input: {
                    id: existingField.id,
                    update: {
                      aggregateOperation:
                        createViewFieldInput.aggregateOperation,
                      isVisible: createViewFieldInput.isVisible,
                      position: createViewFieldInput.position,
                      size: createViewFieldInput.size,
                    },
                  },
                },
              ],
            };
          },
          {
            viewFieldsToUpdate: [],
            viewFieldsToCreate: [],
          },
        );

      await Promise.all([
        performViewFieldAPICreate({ inputs: viewFieldsToCreate }),
        performViewFieldAPIUpdate(viewFieldsToUpdate),
      ]);
    },
    [
      store,
      canPersistChanges,
      performViewFieldAPICreate,
      currentViewIdCallbackState,
      getViewFromPrefetchState,
      performViewFieldAPIUpdate,
    ],
  );

  return {
    saveViewFields,
  };
};
