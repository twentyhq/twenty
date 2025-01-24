import { createComponentFamilySelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilySelectorV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { unsavedToDeleteViewSortIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewSortIdsComponentFamilyState';
import { unsavedToUpsertViewSortsComponentFamilyState } from '@/views/states/unsavedToUpsertViewSortsComponentFamilyState';

export const areViewSortsDifferentFromRecordSortsSelector =
  createComponentFamilySelectorV2<boolean, { viewId?: string }>({
    key: 'areViewSortsDifferentFromRecordSortsSelector',
    get:
      ({ familyKey, instanceId }) =>
      ({ get }) => {
        return (
          get(
            unsavedToUpsertViewSortsComponentFamilyState.atomFamily({
              familyKey,
              instanceId,
            }),
          ).length > 0 ||
          get(
            unsavedToDeleteViewSortIdsComponentFamilyState.atomFamily({
              familyKey,
              instanceId,
            }),
          ).length > 0
        );
      },
    componentInstanceContext: ViewComponentInstanceContext,
  });
