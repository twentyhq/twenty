import { useRecoilCallback } from 'recoil';

import { usePersistViewFieldRecords } from '@/views/hooks/internal/usePersistViewFieldRecords';
import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useGetViewFromCache } from '@/views/hooks/useGetViewFromCache';
import { ViewField } from '@/views/types/ViewField';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useSaveCurrentViewFields = (viewBarComponentId?: string) => {
  const { createViewFieldRecords, updateViewFieldRecords } =
    usePersistViewFieldRecords();

  const { getViewFromCache } = useGetViewFromCache();

  const { isPersistingViewFieldsState, currentViewIdState } =
    useViewStates(viewBarComponentId);

  const saveViewFields = useRecoilCallback(
    ({ set, snapshot }) =>
      async (fields: ViewField[]) => {
        const currentViewId = snapshot
          .getLoadable(currentViewIdState)
          .getValue();

        if (!currentViewId) {
          return;
        }

        set(isPersistingViewFieldsState, true);
        const view = await getViewFromCache(currentViewId);

        if (isUndefinedOrNull(view)) {
          return;
        }

        const viewFieldsToUpdate = fields
          .map((field) => {
            const existingField = view.viewFields.find(
              (viewField) => viewField.id === field.id,
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
                  position: field.position,
                  size: field.size,
                  isVisible: field.isVisible,
                },
              )
            ) {
              return undefined;
            }
            return field;
          })
          .filter(isDefined);

        const viewFieldsToCreate = fields.filter((field) => !field.id);

        await Promise.all([
          createViewFieldRecords(viewFieldsToCreate, view),
          updateViewFieldRecords(viewFieldsToUpdate),
        ]);
        set(isPersistingViewFieldsState, false);
      },
    [
      createViewFieldRecords,
      currentViewIdState,
      getViewFromCache,
      isPersistingViewFieldsState,
      updateViewFieldRecords,
    ],
  );

  return {
    saveViewFields,
  };
};
