import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useChangeView } from '@/views/hooks/useChangeView';
import { useCreateViewFromCurrentView } from '@/views/hooks/useCreateViewFromCurrentView';
import { ViewType } from '@/views/types/ViewType';
import { useCloseAndResetViewPicker } from '@/views/view-picker/hooks/useCloseAndResetViewPicker';
import { viewPickerCalendarFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerCalendarFieldMetadataIdComponentState';
import { viewPickerInputNameComponentState } from '@/views/view-picker/states/viewPickerInputNameComponentState';
import { viewPickerIsDirtyComponentState } from '@/views/view-picker/states/viewPickerIsDirtyComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerMainGroupByFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerMainGroupByFieldMetadataIdComponentState';
import { viewPickerModeComponentState } from '@/views/view-picker/states/viewPickerModeComponentState';
import { viewPickerSelectedIconComponentState } from '@/views/view-picker/states/viewPickerSelectedIconComponentState';
import { viewPickerTypeComponentState } from '@/views/view-picker/states/viewPickerTypeComponentState';
import { viewPickerVisibilityComponentState } from '@/views/view-picker/states/viewPickerVisibilityComponentState';
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

  const viewPickerMainGroupByFieldMetadataIdCallbackState =
    useRecoilComponentCallbackState(
      viewPickerMainGroupByFieldMetadataIdComponentState,
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

  const viewPickerVisibilityCallbackState = useRecoilComponentCallbackState(
    viewPickerVisibilityComponentState,
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
        const mainGroupByFieldMetadataId = getSnapshotValue(
          snapshot,
          viewPickerMainGroupByFieldMetadataIdCallbackState,
        );
        const calendarFieldMetadataId = getSnapshotValue(
          snapshot,
          viewPickerCalendarFieldMetadataIdCallbackState,
        );

        const viewPickerMode = getSnapshotValue(
          snapshot,
          viewPickerModeCallbackState,
        );
        const visibility = getSnapshotValue(
          snapshot,
          viewPickerVisibilityCallbackState,
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
            mainGroupByFieldMetadataId:
              type === ViewType.Kanban ? mainGroupByFieldMetadataId : null,
            calendarFieldMetadataId,
            visibility,
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
      viewPickerMainGroupByFieldMetadataIdCallbackState,
      viewPickerCalendarFieldMetadataIdCallbackState,
      viewPickerSelectedIconCallbackState,
      viewPickerTypeCallbackState,
      viewPickerModeCallbackState,
      viewPickerVisibilityCallbackState,
    ],
  );

  return { createViewFromCurrentState };
};
