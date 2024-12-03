import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { unsavedToDeleteViewFilterGroupIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewFilterGroupIdsComponentFamilyState';
import { unsavedToDeleteViewFilterIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewFilterIdsComponentFamilyState';
import { unsavedToDeleteViewSortIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewSortIdsComponentFamilyState';
import { unsavedToUpsertViewFilterGroupsComponentFamilyState } from '@/views/states/unsavedToUpsertViewFilterGroupsComponentFamilyState';
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

  const unsavedToDeleteViewFilterGroupIdsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToDeleteViewFilterGroupIdsComponentFamilyState,
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

  const unsavedToUpsertViewFilterGroupsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToUpsertViewFilterGroupsComponentFamilyState,
      viewBarInstanceId,
    );

  const resetUnsavedViewStates = useRecoilCallback(
    ({ set }) =>
      (viewId: string) => {
        set(unsavedToDeleteViewFilterGroupIdsCallbackState({ viewId }), []);
        set(setUnsavedToDeleteViewFilterIdsCallbackState({ viewId }), []);
        set(setUnsavedToDeleteViewSortIdsCallbackState({ viewId }), []);
        set(unsavedToUpsertViewFilterGroupsCallbackState({ viewId }), []);
        set(setUnsavedToUpsertViewFiltersCallbackState({ viewId }), []);
        set(unsavedToUpsertViewSortsCallbackState({ viewId }), []);
      },
    [
      unsavedToUpsertViewSortsCallbackState,
      setUnsavedToUpsertViewFiltersCallbackState,
      unsavedToUpsertViewFilterGroupsCallbackState,
      setUnsavedToDeleteViewSortIdsCallbackState,
      setUnsavedToDeleteViewFilterIdsCallbackState,
      unsavedToDeleteViewFilterGroupIdsCallbackState,
    ],
  );

  return {
    resetUnsavedViewStates,
  };
};
