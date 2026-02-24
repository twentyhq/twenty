import { useCallback } from 'react';
import { useStore } from 'jotai';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValueV2';
import { usePerformViewAPIPersist } from '@/views/hooks/internal/usePerformViewAPIPersist';
import { useChangeView } from '@/views/hooks/useChangeView';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { coreViewsByObjectMetadataIdFamilySelector } from '@/views/states/selectors/coreViewsByObjectMetadataIdFamilySelector';
import { coreViewsFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreViewsFromObjectMetadataItemFamilySelector';
import { useCloseAndResetViewPicker } from '@/views/view-picker/hooks/useCloseAndResetViewPicker';
import { viewPickerIsDirtyComponentState } from '@/views/view-picker/states/viewPickerIsDirtyComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';

export const useDestroyViewFromCurrentState = (viewBarInstanceId?: string) => {
  const { closeAndResetViewPicker } = useCloseAndResetViewPicker();

  const viewPickerIsPersistingCallbackState =
    useRecoilComponentStateCallbackStateV2(
      viewPickerIsPersistingComponentState,
      viewBarInstanceId,
    );

  const viewPickerIsDirtyCallbackState = useRecoilComponentStateCallbackStateV2(
    viewPickerIsDirtyComponentState,
    viewBarInstanceId,
  );

  const viewPickerReferenceViewIdCallbackState =
    useRecoilComponentStateCallbackStateV2(
      viewPickerReferenceViewIdComponentState,
      viewBarInstanceId,
    );

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const viewsOnCurrentObject = useFamilySelectorValueV2(
    coreViewsFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId: objectMetadataItem.id },
  );

  const { currentView } = useGetCurrentViewOnly();

  const { changeView } = useChangeView();

  const { performViewAPIDestroy } = usePerformViewAPIPersist();

  const store = useStore();

  const destroyViewFromCurrentState = useCallback(async () => {
    store.set(viewPickerIsPersistingCallbackState, true);
    closeAndResetViewPicker();
    store.set(viewPickerIsDirtyCallbackState, false);

    const viewPickerReferenceViewId = store.get(
      viewPickerReferenceViewIdCallbackState,
    );

    const shouldChangeView = viewPickerReferenceViewId === currentView?.id;

    if (shouldChangeView) {
      changeView(
        viewsOnCurrentObject.filter(
          (view) => view.id !== viewPickerReferenceViewId,
        )[0].id,
      );
    }

    store.set(
      coreViewsByObjectMetadataIdFamilySelector.selectorFamily(
        objectMetadataItem.id,
      ),
      (views) => views.filter((view) => view.id !== viewPickerReferenceViewId),
    );

    await performViewAPIDestroy({ id: viewPickerReferenceViewId });
  }, [
    currentView,
    closeAndResetViewPicker,
    objectMetadataItem.id,
    changeView,
    performViewAPIDestroy,
    store,
    viewPickerIsDirtyCallbackState,
    viewPickerIsPersistingCallbackState,
    viewPickerReferenceViewIdCallbackState,
    viewsOnCurrentObject,
  ]);

  return {
    destroyViewFromCurrentState,
  };
};
