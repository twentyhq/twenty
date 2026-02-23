import { useRecoilCallback } from 'recoil';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValueV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { usePerformViewAPIPersist } from '@/views/hooks/internal/usePerformViewAPIPersist';
import { useChangeView } from '@/views/hooks/useChangeView';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { coreViewsByObjectMetadataIdFamilySelector } from '@/views/states/selectors/coreViewsByObjectMetadataIdFamilySelector';
import { coreViewsFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreViewsFromObjectMetadataItemFamilySelector';
import { useStore } from 'jotai';
import { useCloseAndResetViewPicker } from '@/views/view-picker/hooks/useCloseAndResetViewPicker';
import { viewPickerIsDirtyComponentState } from '@/views/view-picker/states/viewPickerIsDirtyComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';

export const useDestroyViewFromCurrentState = (viewBarInstanceId?: string) => {
  const { closeAndResetViewPicker } = useCloseAndResetViewPicker();

  const viewPickerIsPersistingCallbackState = useRecoilComponentCallbackState(
    viewPickerIsPersistingComponentState,
    viewBarInstanceId,
  );

  const viewPickerIsDirtyCallbackState = useRecoilComponentCallbackState(
    viewPickerIsDirtyComponentState,
    viewBarInstanceId,
  );

  const viewPickerReferenceViewIdCallbackState =
    useRecoilComponentCallbackState(
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

  const destroyViewFromCurrentState = useRecoilCallback(
    ({ set, snapshot }) =>
      async () => {
        set(viewPickerIsPersistingCallbackState, true);
        closeAndResetViewPicker();
        set(viewPickerIsDirtyCallbackState, false);

        const viewPickerReferenceViewId = getSnapshotValue(
          snapshot,
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
          (views) =>
            views.filter((view) => view.id !== viewPickerReferenceViewId),
        );

        await performViewAPIDestroy({ id: viewPickerReferenceViewId });
      },
    [
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
    ],
  );

  return {
    destroyViewFromCurrentState,
  };
};
