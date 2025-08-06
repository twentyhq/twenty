import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { prefetchViewsFromObjectMetadataItemFamilySelector } from '@/prefetch/states/selector/prefetchViewsFromObjectMetadataItemFamilySelector';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
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
