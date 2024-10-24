import { createComponentFamilySelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilySelectorV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { unsavedToDeleteViewFilterIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewFilterIdsComponentFamilyState';
import { unsavedToDeleteViewSortIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewSortIdsComponentFamilyState';
import { unsavedToUpsertViewFiltersComponentFamilyState } from '@/views/states/unsavedToUpsertViewFiltersComponentFamilyState';
import { unsavedToUpsertViewSortsComponentFamilyState } from '@/views/states/unsavedToUpsertViewSortsComponentFamilyState';

export const canPersistViewComponentFamilySelector =
  createComponentFamilySelectorV2<boolean, { viewId?: string }>({
    key: 'canPersistViewComponentFamilySelector',
    get:
      ({ familyKey, instanceId }) =>
      ({ get }) => {
        return (
          get(
            unsavedToUpsertViewFiltersComponentFamilyState.atomFamily({
              familyKey,
              instanceId,
            }),
          ).length > 0 ||
          get(
            unsavedToUpsertViewSortsComponentFamilyState.atomFamily({
              familyKey,
              instanceId,
            }),
          ).length > 0 ||
          get(
            unsavedToDeleteViewFilterIdsComponentFamilyState.atomFamily({
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
