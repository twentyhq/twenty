import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { unsavedToDeleteViewFilterIdsComponentState } from '@/views/states/unsavedToDeleteViewFilterIdsComponentState';
import { unsavedToDeleteViewSortIdsComponentState } from '@/views/states/unsavedToDeleteViewSortIdsComponentState';
import { unsavedToUpsertViewFiltersComponentState } from '@/views/states/unsavedToUpsertViewFiltersComponentState';
import { unsavedToUpsertViewSortsComponentState } from '@/views/states/unsavedToUpsertViewSortsComponentState';

export const canResetViewComponentSelector = createComponentSelectorV2({
  key: 'canResetViewComponentSelector',
  get:
    ({ instanceId }: { instanceId: string }) =>
    ({ get }) => {
      return (
        get(unsavedToUpsertViewFiltersComponentState.atomFamily({ instanceId }))
          .length === 0 &&
        get(unsavedToUpsertViewSortsComponentState.atomFamily({ instanceId }))
          .length === 0 &&
        get(
          unsavedToDeleteViewFilterIdsComponentState.atomFamily({ instanceId }),
        ).length === 0 &&
        get(unsavedToDeleteViewSortIdsComponentState.atomFamily({ instanceId }))
          .length === 0
      );
    },
  instanceContext: ViewComponentInstanceContext,
});
