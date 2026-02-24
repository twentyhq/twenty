import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
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
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useCreateViewFromCurrentState = () => {
  const { closeAndResetViewPicker } = useCloseAndResetViewPicker();

  const viewPickerInputNameCallbackState =
    useRecoilComponentStateCallbackStateV2(viewPickerInputNameComponentState);

  const viewPickerSelectedIconCallbackState =
    useRecoilComponentStateCallbackStateV2(
      viewPickerSelectedIconComponentState,
    );

  const viewPickerTypeCallbackState = useRecoilComponentStateCallbackStateV2(
    viewPickerTypeComponentState,
  );

  const viewPickerMainGroupByFieldMetadataIdCallbackState =
    useRecoilComponentStateCallbackStateV2(
      viewPickerMainGroupByFieldMetadataIdComponentState,
    );

  const viewPickerCalendarFieldMetadataIdCallbackState =
    useRecoilComponentStateCallbackStateV2(
      viewPickerCalendarFieldMetadataIdComponentState,
    );

  const viewPickerIsPersistingCallbackState =
    useRecoilComponentStateCallbackStateV2(
      viewPickerIsPersistingComponentState,
    );

  const viewPickerIsDirtyCallbackState = useRecoilComponentStateCallbackStateV2(
    viewPickerIsDirtyComponentState,
  );

  const viewPickerModeCallbackState = useRecoilComponentStateCallbackStateV2(
    viewPickerModeComponentState,
  );

  const viewPickerVisibilityCallbackState =
    useRecoilComponentStateCallbackStateV2(viewPickerVisibilityComponentState);

  const { createViewFromCurrentView } = useCreateViewFromCurrentView();
  const { changeView } = useChangeView();

  const store = useStore();

  const createViewFromCurrentState = useCallback(async () => {
    const name = store.get(viewPickerInputNameCallbackState);
    const iconKey = store.get(viewPickerSelectedIconCallbackState);
    const type = store.get(viewPickerTypeCallbackState);
    const mainGroupByFieldMetadataId = store.get(
      viewPickerMainGroupByFieldMetadataIdCallbackState,
    );
    const calendarFieldMetadataId = store.get(
      viewPickerCalendarFieldMetadataIdCallbackState,
    );

    const viewPickerMode = store.get(viewPickerModeCallbackState);
    const visibility = store.get(viewPickerVisibilityCallbackState);

    const shouldCopyFiltersAndSortsAndAggregate =
      viewPickerMode === 'create-from-current';

    store.set(viewPickerIsPersistingCallbackState, true);
    store.set(viewPickerIsDirtyCallbackState, false);

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
  }, [
    store,
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
  ]);

  return { createViewFromCurrentState };
};
