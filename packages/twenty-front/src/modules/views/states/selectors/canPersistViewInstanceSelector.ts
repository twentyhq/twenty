import { createInstanceSelector } from '@/ui/utilities/state/instance/utils/createInstanceSelector';
import { ViewInstanceContext } from '@/views/states/contexts/ViewInstanceContext';
import { unsavedToDeleteViewFilterIdsInstanceState } from '@/views/states/unsavedToDeleteViewFilterIdsInstanceState';
import { unsavedToDeleteViewSortIdsInstanceState } from '@/views/states/unsavedToDeleteViewSortIdsInstanceState';
import { unsavedToUpsertViewFiltersInstanceState } from '@/views/states/unsavedToUpsertViewFiltersInstanceState';
import { unsavedToUpsertViewSortsInstanceState } from '@/views/states/unsavedToUpsertViewSortsInstanceState';

export const canPersistViewInstanceSelector = createInstanceSelector({
  key: 'canPersistViewInstanceSelector',
  get:
    ({ instanceId }: { instanceId: string }) =>
    ({ get }) => {
      return (
        get(unsavedToUpsertViewFiltersInstanceState.atomFamily({ instanceId }))
          .length > 0 ||
        get(unsavedToUpsertViewSortsInstanceState.atomFamily({ instanceId }))
          .length > 0 ||
        get(
          unsavedToDeleteViewFilterIdsInstanceState.atomFamily({ instanceId }),
        ).length > 0 ||
        get(unsavedToDeleteViewSortIdsInstanceState.atomFamily({ instanceId }))
          .length > 0
      );
    },
  instanceContext: ViewInstanceContext,
});
