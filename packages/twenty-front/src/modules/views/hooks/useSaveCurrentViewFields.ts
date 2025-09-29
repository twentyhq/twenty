import { useRecoilCallback } from 'recoil';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { usePersistViewFieldRecords } from '@/views/hooks/internal/usePersistViewFieldRecords';
import { useGetViewFromPrefetchState } from '@/views/hooks/useGetViewFromPrefetchState';
import { isPersistingViewFieldsState } from '@/views/states/isPersistingViewFieldsState';
import { type ViewField } from '@/views/types/ViewField';
import {
  type CreateCoreViewFieldMutationVariables,
  type CreateViewFieldInput,
  type UpdateCoreViewFieldMutationVariables,
} from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useSaveCurrentViewFields = () => {
  const { createViewFieldRecords, updateViewFieldRecords } =
    usePersistViewFieldRecords();

  const { getViewFromPrefetchState } = useGetViewFromPrefetchState();

  const currentViewIdCallbackState = useRecoilComponentCallbackState(
    contextStoreCurrentViewIdComponentState,
  );

  const saveViewFields = useRecoilCallback(
    ({ set, snapshot }) =>
      async (viewFieldsToSave: Omit<ViewField, 'definition'>[]) => {
        const currentViewId = snapshot
          .getLoadable(currentViewIdCallbackState)
          .getValue();

        if (!currentViewId) {
          return;
        }

        set(isPersistingViewFieldsState, true);

        const view = getViewFromPrefetchState(currentViewId);

        if (isUndefinedOrNull(view)) {
          return;
        }

        const currentViewFields = view.viewFields;

        const { viewFieldsToCreate, viewFieldsToUpdate } =
          viewFieldsToSave.reduce<{
            viewFieldsToCreate: CreateCoreViewFieldMutationVariables[];
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
                    { input: createViewFieldInput },
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
                  },
                  {
                    position: createViewFieldInput.position,
                    size: createViewFieldInput.size,
                    isVisible: createViewFieldInput.isVisible,
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
                      id: createViewFieldInput.id,
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
          createViewFieldRecords(viewFieldsToCreate),
          updateViewFieldRecords(viewFieldsToUpdate),
        ]);

        set(isPersistingViewFieldsState, false);
      },
    [
      createViewFieldRecords,
      currentViewIdCallbackState,
      getViewFromPrefetchState,
      updateViewFieldRecords,
    ],
  );

  return {
    saveViewFields,
  };
};
