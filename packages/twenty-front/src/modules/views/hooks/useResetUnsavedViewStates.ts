import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { unsavedToDeleteViewFilterGroupIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewFilterGroupIdsComponentFamilyState';
import { unsavedToDeleteViewFilterIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewFilterIdsComponentFamilyState';
import { unsavedToDeleteViewSortIdsComponentFamilyState } from '@/views/states/unsavedToDeleteViewSortIdsComponentFamilyState';
import { unsavedToUpsertViewFilterGroupsComponentFamilyState } from '@/views/states/unsavedToUpsertViewFilterGroupsComponentFamilyState';
import { unsavedToUpsertViewFiltersComponentFamilyState } from '@/views/states/unsavedToUpsertViewFiltersComponentFamilyState';
import { unsavedToUpsertViewSortsComponentFamilyState } from '@/views/states/unsavedToUpsertViewSortsComponentFamilyState';
import { useRecoilCallback } from 'recoil';

export const useResetUnsavedViewStates = (viewBarInstanceId?: string) => {
  const unsavedToDeleteViewFilterIdsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToDeleteViewFilterIdsComponentFamilyState,
      viewBarInstanceId,
    );

  const unsavedToDeleteViewSortIdsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToDeleteViewSortIdsComponentFamilyState,
      viewBarInstanceId,
    );

  const unsavedToDeleteViewFilterGroupIdsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToDeleteViewFilterGroupIdsComponentFamilyState,
      viewBarInstanceId,
    );

  const unsavedToUpsertViewFiltersCallbackState =
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
        set(unsavedToDeleteViewFilterIdsCallbackState({ viewId }), []);
        set(unsavedToDeleteViewSortIdsCallbackState({ viewId }), []);
        set(unsavedToUpsertViewFilterGroupsCallbackState({ viewId }), []);
        set(unsavedToUpsertViewFiltersCallbackState({ viewId }), []);
        set(unsavedToUpsertViewSortsCallbackState({ viewId }), []);
      },
    [
      unsavedToUpsertViewSortsCallbackState,
      unsavedToUpsertViewFiltersCallbackState,
      unsavedToUpsertViewFilterGroupsCallbackState,
      unsavedToDeleteViewSortIdsCallbackState,
      unsavedToDeleteViewFilterIdsCallbackState,
      unsavedToDeleteViewFilterGroupIdsCallbackState,
    ],
  );

  return {
    resetUnsavedViewStates,
  };
};
