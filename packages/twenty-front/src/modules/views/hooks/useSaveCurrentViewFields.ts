import { useRecoilCallback } from 'recoil';

import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { usePersistViewFieldRecords } from '@/views/hooks/internal/usePersistViewFieldRecords';
import { useGetViewFromPrefetchState } from '@/views/hooks/useGetViewFromPrefetchState';
import { isPersistingViewFieldsState } from '@/views/states/isPersistingViewFieldsState';
import { ViewField } from '@/views/types/ViewField';
import { isDefined } from 'twenty-shared/utils';
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
      async (viewFieldsToSave: ViewField[]) => {
        const currentViewId = snapshot
          .getLoadable(currentViewIdCallbackState)
          .getValue();

        if (!currentViewId) {
          return;
        }

        set(isPersistingViewFieldsState, true);

        const view = await getViewFromPrefetchState(currentViewId);

        if (isUndefinedOrNull(view)) {
          return;
        }

        const currentViewFields = view.viewFields;

        const viewFieldsToUpdate = viewFieldsToSave
          .map((viewFieldToSave) => {
            const existingField = currentViewFields.find(
              (currentViewField) =>
                currentViewField.fieldMetadataId ===
                viewFieldToSave.fieldMetadataId,
            );

            if (isUndefinedOrNull(existingField)) {
              return undefined;
            }

            if (
              isDeeplyEqual(
                {
                  position: existingField.position,
                  size: existingField.size,
                  isVisible: existingField.isVisible,
                },
                {
                  position: viewFieldToSave.position,
                  size: viewFieldToSave.size,
                  isVisible: viewFieldToSave.isVisible,
                },
              )
            ) {
              return undefined;
            }

            return { ...viewFieldToSave, id: existingField.id };
          })
          .filter(isDefined);

        const viewFieldsToCreate = viewFieldsToSave.filter(
          (viewFieldToSave) =>
            !currentViewFields.some(
              (currentViewField) =>
                currentViewField.fieldMetadataId ===
                viewFieldToSave.fieldMetadataId,
            ),
        );

        await Promise.all([
          createViewFieldRecords(viewFieldsToCreate, view),
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
