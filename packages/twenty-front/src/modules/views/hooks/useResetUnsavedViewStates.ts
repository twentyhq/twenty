import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { unsavedToDeleteViewFilterGroupIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewFilterGroupIdsComponentFamilyState';
import { unsavedToUpsertViewFilterGroupsComponentFamilyState } from '@/views/states/unsavedToUpsertViewFilterGroupsComponentFamilyState';
import { useRecoilCallback } from 'recoil';

export const useResetUnsavedViewStates = (viewBarInstanceId?: string) => {
  const unsavedToDeleteViewFilterGroupIdsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToDeleteViewFilterGroupIdsComponentFamilyState,
      viewBarInstanceId,
    );

  const unsavedToUpsertViewFilterGroupsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToUpsertViewFilterGroupsComponentFamilyState,
      viewBarInstanceId,
    );

  const resetUnsavedViewStates = useRecoilCallback(
    ({ set }) =>
      (viewId: string) => {
        set(unsavedToDeleteViewFilterGroupIdsCallbackState({ viewId }), []);
        set(unsavedToUpsertViewFilterGroupsCallbackState({ viewId }), []);
      },
    [
      unsavedToUpsertViewFilterGroupsCallbackState,
      unsavedToDeleteViewFilterGroupIdsCallbackState,
    ],
  );

  return {
    resetUnsavedViewStates,
  };
};
