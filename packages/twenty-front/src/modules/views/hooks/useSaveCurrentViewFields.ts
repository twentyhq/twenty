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

            const hasRelationScopeChanged = !isDeeplyEqual(
              getViewFieldRelationScopeInput(existingField.relationScope) ??
                null,
              createViewFieldInput.relationScope ?? null,
            );

            if (
              !hasRelationScopeChanged &&
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
                      ...(hasRelationScopeChanged && {
                        relationScope: createViewFieldInput.relationScope,
                      }),
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
