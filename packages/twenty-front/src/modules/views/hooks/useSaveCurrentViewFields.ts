import { getViewFieldSettingsInput } from '@/views/utils/getViewFieldSettingsInput';
import { useStore } from 'jotai';
import { useCallback } from 'react';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { usePerformViewFieldApiPersist } from '@/views/hooks/internal/usePerformViewFieldApiPersist';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetViewFromState } from '@/views/hooks/useGetViewFromState';
import { type ViewField } from '@/views/types/ViewField';
import {
  type CreateViewFieldInput,
  type UpdateViewFieldMutationVariables,
} from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isDefined } from 'twenty-shared/utils';

export const useSaveCurrentViewFields = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const { performViewFieldApiCreate, performViewFieldApiUpdate } =
    usePerformViewFieldApiPersist();

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

      if (!isDefined(view)) {
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
              settings: getViewFieldSettingsInput(
                viewFieldToCreateOrUpdate.settings,
              ),
              viewId: currentViewId,
            };
            const existingField = currentViewFields.find(
              (currentViewField) =>
                currentViewField.id === viewFieldToCreateOrUpdate.id,
            );

            if (!isDefined(existingField)) {
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
                  settings: getViewFieldSettingsInput(existingField.settings),
                },
                {
                  position: createViewFieldInput.position,
                  size: createViewFieldInput.size,
                  isVisible: createViewFieldInput.isVisible,
                  aggregateOperation: createViewFieldInput.aggregateOperation,
                  settings: createViewFieldInput.settings,
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
                      settings: createViewFieldInput.settings,
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
        performViewFieldApiCreate({ inputs: viewFieldsToCreate }),
        performViewFieldApiUpdate(viewFieldsToUpdate),
      ]);
    },
    [
      store,
      canPersistChanges,
      performViewFieldApiCreate,
      currentViewIdCallbackState,
      getViewFromState,
      performViewFieldApiUpdate,
    ],
  );

  return {
    saveViewFields,
  };
};
