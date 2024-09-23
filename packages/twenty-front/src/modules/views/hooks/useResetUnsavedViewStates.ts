import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { unsavedToDeleteViewFilterIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewFilterIdsComponentFamilyState';
import { unsavedToDeleteViewSortIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewSortIdsComponentFamilyState';
import { unsavedToUpsertViewFiltersComponentFamilyState } from '@/views/states/unsavedToUpsertViewFiltersComponentFamilyState';
import { unsavedToUpsertViewSortsComponentFamilyState } from '@/views/states/unsavedToUpsertViewSortsComponentFamilyState';
import { useRecoilCallback } from 'recoil';

export const useResetUnsavedViewStates = (viewBarInstanceId?: string) => {
  const setUnsavedToDeleteViewFilterIdsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToDeleteViewFilterIdsComponentFamilyState,
      viewBarInstanceId,
    );

  const setUnsavedToDeleteViewSortIdsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToDeleteViewSortIdsComponentFamilyState,
      viewBarInstanceId,
    );

  const setUnsavedToUpsertViewFiltersCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToUpsertViewFiltersComponentFamilyState,
      viewBarInstanceId,
    );

  const unsavedToUpsertViewSortsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToUpsertViewSortsComponentFamilyState,
      viewBarInstanceId,
    );

  const resetUnsavedViewStates = useRecoilCallback(
    ({ set }) =>
      (viewId: string) => {
        set(setUnsavedToDeleteViewFilterIdsCallbackState({ viewId }), []);
        set(setUnsavedToDeleteViewSortIdsCallbackState({ viewId }), []);
        set(setUnsavedToUpsertViewFiltersCallbackState({ viewId }), []);
        set(unsavedToUpsertViewSortsCallbackState({ viewId }), []);
      },
    [
      unsavedToUpsertViewSortsCallbackState,
      setUnsavedToUpsertViewFiltersCallbackState,
      setUnsavedToDeleteViewSortIdsCallbackState,
      setUnsavedToDeleteViewFilterIdsCallbackState,
    ],
  );

  return {
    resetUnsavedViewStates,
  };
};
