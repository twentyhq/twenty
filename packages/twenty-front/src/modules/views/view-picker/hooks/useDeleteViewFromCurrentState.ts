import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { prefetchViewsFromObjectMetadataItemFamilySelector } from '@/prefetch/states/selector/prefetchViewsFromObjectMetadataItemFamilySelector';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useChangeView } from '@/views/hooks/useChangeView';
import { useDeleteView } from '@/views/hooks/useDeleteView';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useCloseAndResetViewPicker } from '@/views/view-picker/hooks/useCloseAndResetViewPicker';
import { viewPickerIsDirtyComponentState } from '@/views/view-picker/states/viewPickerIsDirtyComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';

export const useDeleteViewFromCurrentState = (viewBarInstanceId?: string) => {
  const { closeAndResetViewPicker } = useCloseAndResetViewPicker();

  const viewPickerIsPersistingCallbackState = useRecoilComponentCallbackStateV2(
    viewPickerIsPersistingComponentState,
    viewBarInstanceId,
  );

  const viewPickerIsDirtyCallbackState = useRecoilComponentCallbackStateV2(
    viewPickerIsDirtyComponentState,
    viewBarInstanceId,
  );

  const viewPickerReferenceViewIdCallbackState =
    useRecoilComponentCallbackStateV2(
      viewPickerReferenceViewIdComponentState,
      viewBarInstanceId,
    );

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const viewsOnCurrentObject = useRecoilValue(
    prefetchViewsFromObjectMetadataItemFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const { currentView } = useGetCurrentViewOnly();

  const { changeView } = useChangeView();

  const { deleteView } = useDeleteView();

  const deleteViewFromCurrentState = useRecoilCallback(
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

        await deleteView(viewPickerReferenceViewId);
      },
    [
      currentView,
      closeAndResetViewPicker,
      changeView,
      deleteView,
      viewPickerIsDirtyCallbackState,
      viewPickerIsPersistingCallbackState,
      viewPickerReferenceViewIdCallbackState,
      viewsOnCurrentObject,
    ],
  );

  return {
    deleteViewFromCurrentState,
  };
};
