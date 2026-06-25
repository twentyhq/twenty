import { useStore } from 'jotai';
import { useCallback } from 'react';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { usePerformViewFieldAPIPersist } from '@/views/hooks/internal/usePerformViewFieldAPIPersist';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetViewFromState } from '@/views/hooks/useGetViewFromState';
import { type ViewField } from '@/views/types/ViewField';
import {
  type CreateViewFieldInput,
  type UpdateViewFieldMutationVariables,
} from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useSaveCurrentViewFields = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const { performViewFieldAPICreate, performViewFieldAPIUpdate } =
    usePerformViewFieldAPIPersist();

  const { getViewFromState } = useGetViewFromState();

  const currentViewIdCallbackState = useAtomComponentStateCallbackState(
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

      const view = getViewFromState(currentViewId);

      if (isUndefinedOrNull(view)) {
        return;
      }

      const currentViewFields = view.viewFields;

      const { viewFieldsToCreate, viewFieldsToUpdate } =
        viewFieldsToSave.reduce<{
          viewFieldsToCreate: CreateViewFieldInput[];
          viewFieldsToUpdate: UpdateViewFieldMutationVariables[];
        }>(
          (
            { viewFieldsToCreate, viewFieldsToUpdate },
            viewFieldToCreateOrUpdate,
          ) => {
            const createViewFieldInput: CreateViewFieldInput = {
              id: viewFieldToCreateOrUpdate.id,
              fieldMetadataId: viewFieldToCreateOrUpdate.fieldMetadataId,
              position: viewFieldToCreateOrUpdate.position,
              isVisible: viewFieldToCreateOrUpdate.isVisible,
              size: viewFieldToCreateOrUpdate.size,
              aggregateOperation: viewFieldToCreateOrUpdate.aggregateOperation,
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
      getViewFromState,
      performViewFieldAPIUpdate,
    ],
  );

  return {
    saveViewFields,
  };
};
