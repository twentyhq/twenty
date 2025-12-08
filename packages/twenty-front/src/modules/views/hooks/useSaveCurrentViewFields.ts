import { useRecoilCallback } from 'recoil';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { usePersistViewField } from '@/views/hooks/internal/usePersistViewField';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetViewFromPrefetchState } from '@/views/hooks/useGetViewFromPrefetchState';
import { type ViewField } from '@/views/types/ViewField';
import {
  type CreateViewFieldInput,
  type UpdateCoreViewFieldMutationVariables,
} from '~/generated/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useSaveCurrentViewFields = () => {
  const { canPersistChanges } = useCanPersistViewChanges();
  const { createViewFields, updateViewFields } = usePersistViewField();

  const { getViewFromPrefetchState } = useGetViewFromPrefetchState();

  const currentViewIdCallbackState = useRecoilComponentCallbackState(
    contextStoreCurrentViewIdComponentState,
  );

  const saveViewFields = useRecoilCallback(
    ({ snapshot }) =>
      async (viewFieldsToSave: Omit<ViewField, 'definition'>[]) => {
        if (!canPersistChanges) {
          return;
        }

        const currentViewId = snapshot
          .getLoadable(currentViewIdCallbackState)
          .getValue();

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
          createViewFields({ inputs: viewFieldsToCreate }),
          updateViewFields(viewFieldsToUpdate),
        ]);
      },
    [
      canPersistChanges,
      createViewFields,
      currentViewIdCallbackState,
      getViewFromPrefetchState,
      updateViewFields,
    ],
  );

  return {
    saveViewFields,
  };
};
