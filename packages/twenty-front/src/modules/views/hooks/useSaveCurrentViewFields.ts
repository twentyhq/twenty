import { useRecoilCallback } from 'recoil';

import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { usePersistViewFieldRecords } from '@/views/hooks/internal/usePersistViewFieldRecords';
import { useGetViewFromCache } from '@/views/hooks/useGetViewFromCache';
import { currentViewIdComponentState } from '@/views/states/currentViewIdComponentState';
import { isPersistingViewFieldsComponentState } from '@/views/states/isPersistingViewFieldsComponentState';
import { ViewField } from '@/views/types/ViewField';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useSaveCurrentViewFields = (viewBarComponentId?: string) => {
  const { createViewFieldRecords, updateViewFieldRecords } =
    usePersistViewFieldRecords();

  const { getViewFromCache } = useGetViewFromCache();

  const currentViewIdCallbackState = useRecoilComponentCallbackStateV2(
    currentViewIdComponentState,
    viewBarComponentId,
  );

  const isPersistingViewFieldsCallbackState = useRecoilComponentCallbackStateV2(
    isPersistingViewFieldsComponentState,
    viewBarComponentId,
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

        set(isPersistingViewFieldsCallbackState, true);

        const view = await getViewFromCache(currentViewId);

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

        set(isPersistingViewFieldsCallbackState, false);
      },
    [
      createViewFieldRecords,
      currentViewIdCallbackState,
      getViewFromCache,
      isPersistingViewFieldsCallbackState,
      updateViewFieldRecords,
    ],
  );

  return {
    saveViewFields,
  };
};
