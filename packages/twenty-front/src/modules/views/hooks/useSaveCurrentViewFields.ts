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
import isEmpty from 'lodash.isempty';
import { getDirtyFields } from '~/utils/getDirtyFields';
import { isDefined } from 'twenty-shared/utils';
import { removeTypenames } from '~/utils/removeTypenames';

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
    async (
      viewFieldsToSave: Omit<ViewField, 'definition'>[],
    ): Promise<boolean> => {
      if (!canPersistChanges) {
        return false;
      }

      const currentViewId = store.get(currentViewIdCallbackState);

      if (!currentViewId) {
        return false;
      }

      const view = getViewFromState(currentViewId);

      if (!isDefined(view)) {
        return false;
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
              isCanonical: viewFieldToCreateOrUpdate.isCanonical,
              relationTargetFieldMetadataId:
                viewFieldToCreateOrUpdate.relationTargetFieldMetadataId,
              relationScope: removeTypenames(
                viewFieldToCreateOrUpdate.relationScope,
              ),
              label: viewFieldToCreateOrUpdate.label,
              size: viewFieldToCreateOrUpdate.size,
              aggregateOperation: viewFieldToCreateOrUpdate.aggregateOperation,
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

            const updatedProperties = {
              position: createViewFieldInput.position,
              size: createViewFieldInput.size,
              isVisible: createViewFieldInput.isVisible,
              aggregateOperation: createViewFieldInput.aggregateOperation,
              relationScope: createViewFieldInput.relationScope ?? null,
              relationTargetFieldMetadataId:
                createViewFieldInput.relationTargetFieldMetadataId ?? null,
              label: createViewFieldInput.label ?? null,
            };

            const existingProperties: typeof updatedProperties = {
              position: existingField.position,
              size: existingField.size,
              isVisible: existingField.isVisible,
              aggregateOperation: existingField.aggregateOperation,
              relationScope:
                removeTypenames(existingField.relationScope) ?? null,
              relationTargetFieldMetadataId:
                existingField.relationTargetFieldMetadataId ?? null,
              label: existingField.label ?? null,
            };

            const changedProperties = getDirtyFields(
              updatedProperties,
              existingProperties,
            );

            if (isEmpty(changedProperties)) {
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
                    // Column settings are sent only when changed, so a resize never rewrites them
                    update: {
                      aggregateOperation:
                        createViewFieldInput.aggregateOperation,
                      isVisible: createViewFieldInput.isVisible,
                      position: createViewFieldInput.position,
                      size: createViewFieldInput.size,
                      ...changedProperties,
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

      const results = await Promise.all([
        performViewFieldApiCreate({ inputs: viewFieldsToCreate }),
        performViewFieldApiUpdate(viewFieldsToUpdate),
      ]);

      return results.every(({ status }) => status === 'successful');
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
