import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useChangeView } from '@/views/hooks/useChangeView';
import { useCreateViewFromCurrentView } from '@/views/hooks/useCreateViewFromCurrentView';
import { useCloseAndResetViewPicker } from '@/views/view-picker/hooks/useCloseAndResetViewPicker';
import { viewPickerCalendarFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerCalendarFieldMetadataIdComponentState';
import { viewPickerInputNameComponentState } from '@/views/view-picker/states/viewPickerInputNameComponentState';
import { viewPickerIsDirtyComponentState } from '@/views/view-picker/states/viewPickerIsDirtyComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerKanbanFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerKanbanFieldMetadataIdComponentState';
import { viewPickerModeComponentState } from '@/views/view-picker/states/viewPickerModeComponentState';
import { viewPickerSelectedIconComponentState } from '@/views/view-picker/states/viewPickerSelectedIconComponentState';
import { viewPickerTypeComponentState } from '@/views/view-picker/states/viewPickerTypeComponentState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useCreateViewFromCurrentState = () => {
  const { closeAndResetViewPicker } = useCloseAndResetViewPicker();

  const viewPickerInputNameCallbackState = useRecoilComponentCallbackState(
    viewPickerInputNameComponentState,
  );

  const viewPickerSelectedIconCallbackState = useRecoilComponentCallbackState(
    viewPickerSelectedIconComponentState,
  );

  const viewPickerTypeCallbackState = useRecoilComponentCallbackState(
    viewPickerTypeComponentState,
  );

  const viewPickerKanbanFieldMetadataIdCallbackState =
    useRecoilComponentCallbackState(
      viewPickerKanbanFieldMetadataIdComponentState,
    );

  const viewPickerCalendarFieldMetadataIdCallbackState =
    useRecoilComponentCallbackState(
      viewPickerCalendarFieldMetadataIdComponentState,
    );

  const viewPickerIsPersistingCallbackState = useRecoilComponentCallbackState(
    viewPickerIsPersistingComponentState,
  );

  const viewPickerIsDirtyCallbackState = useRecoilComponentCallbackState(
    viewPickerIsDirtyComponentState,
  );

  const viewPickerModeCallbackState = useRecoilComponentCallbackState(
    viewPickerModeComponentState,
  );

  const { createViewFromCurrentView } = useCreateViewFromCurrentView();
  const { changeView } = useChangeView();

  const createViewFromCurrentState = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const name = getSnapshotValue(
          snapshot,
          viewPickerInputNameCallbackState,
        );
        const iconKey = getSnapshotValue(
          snapshot,
          viewPickerSelectedIconCallbackState,
        );
        const type = getSnapshotValue(snapshot, viewPickerTypeCallbackState);
        const kanbanFieldMetadataId = getSnapshotValue(
          snapshot,
          viewPickerKanbanFieldMetadataIdCallbackState,
        );
        const calendarFieldMetadataId = getSnapshotValue(
          snapshot,
          viewPickerCalendarFieldMetadataIdCallbackState,
        );
        const viewPickerMode = getSnapshotValue(
          snapshot,
          viewPickerModeCallbackState,
        );

        const shouldCopyFiltersAndSortsAndAggregate =
          viewPickerMode === 'create-from-current';

        set(viewPickerIsPersistingCallbackState, true);
        set(viewPickerIsDirtyCallbackState, false);

        const createdViewId = await createViewFromCurrentView(
          {
            name,
            icon: iconKey,
            type,
            kanbanFieldMetadataId,
            calendarFieldMetadataId,
          },
          shouldCopyFiltersAndSortsAndAggregate,
        );

        if (isDefined(createdViewId)) {
          closeAndResetViewPicker();
          changeView(createdViewId);
        }
      },
    [
      closeAndResetViewPicker,
      createViewFromCurrentView,
      changeView,
      viewPickerInputNameCallbackState,
      viewPickerIsDirtyCallbackState,
      viewPickerIsPersistingCallbackState,
      viewPickerKanbanFieldMetadataIdCallbackState,
      viewPickerCalendarFieldMetadataIdCallbackState,
      viewPickerSelectedIconCallbackState,
      viewPickerTypeCallbackState,
      viewPickerModeCallbackState,
    ],
  );

  return { createViewFromCurrentState };
};
