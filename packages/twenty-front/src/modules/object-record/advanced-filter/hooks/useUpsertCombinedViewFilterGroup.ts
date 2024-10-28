import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { unsavedToUpsertViewFilterGroupsComponentFamilyState } from '@/views/states/unsavedToUpsertViewFilterGroupsComponentFamilyState';
import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { useRecoilCallback } from 'recoil';

export const useUpsertCombinedViewFilterGroup = () => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    ViewComponentInstanceContext,
  );

  const unsavedToUpsertViewFilterGroupsCallbackState =
    useRecoilComponentCallbackStateV2(
      unsavedToUpsertViewFilterGroupsComponentFamilyState,
      instanceId,
    );

  const upsertCombinedViewFilterGroup = useRecoilCallback(
    ({ snapshot, set }) =>
      (newViewFilterGroup: Omit<ViewFilterGroup, '__typename'>) => {
        const currentViewUnsavedToUpsertViewFilterGroups =
          unsavedToUpsertViewFilterGroupsCallbackState({
            viewId: newViewFilterGroup.viewId,
          });

        const unsavedToUpsertViewFilterGroups = getSnapshotValue(
          snapshot,
          currentViewUnsavedToUpsertViewFilterGroups,
        );

        const newViewFilterWithTypename: ViewFilterGroup = {
          ...newViewFilterGroup,
          __typename: 'ViewFilterGroup',
        };

        set(
          unsavedToUpsertViewFilterGroupsCallbackState({
            viewId: newViewFilterGroup.viewId,
          }),
          [
            ...unsavedToUpsertViewFilterGroups.filter(
              (viewFilterGroup) => viewFilterGroup.id !== newViewFilterGroup.id,
            ),
            newViewFilterWithTypename,
          ],
        );
      },
    [unsavedToUpsertViewFilterGroupsCallbackState],
  );

  return { upsertCombinedViewFilterGroup };
};
