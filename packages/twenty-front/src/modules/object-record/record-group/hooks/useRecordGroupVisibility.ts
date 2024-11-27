import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexRecordGroupHideComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupHideComponentState';
import { recordIndexRowIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRowIdsByGroupComponentFamilyState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useSaveCurrentViewGroups } from '@/views/hooks/useSaveCurrentViewGroups';
import { mapRecordGroupDefinitionsToViewGroups } from '@/views/utils/mapRecordGroupDefinitionsToViewGroups';
import { recordGroupDefinitionToViewGroup } from '@/views/utils/recordGroupDefinitionToViewGroup';
import { useRecoilCallback } from 'recoil';
import { isDefined } from '~/utils/isDefined';

type UseRecordGroupVisibilityParams = {
  viewBarId: string;
};

export const useRecordGroupVisibility = ({
  viewBarId,
}: UseRecordGroupVisibilityParams) => {
  const recordIndexRecordGroupIdsState = useRecoilComponentCallbackStateV2(
    recordGroupIdsComponentState,
  );

  const recordIndexRowIdsByGroupFamilyState = useRecoilComponentCallbackStateV2(
    recordIndexRowIdsByGroupComponentFamilyState,
    viewBarId,
  );

  const objectOptionsDropdownRecordGroupHideState =
    useRecoilComponentCallbackStateV2(recordIndexRecordGroupHideComponentState);

  const { saveViewGroup, saveViewGroups } = useSaveCurrentViewGroups(viewBarId);

  const handleVisibilityChange = useRecoilCallback(
    ({ set }) =>
      async (updatedRecordGroup: RecordGroupDefinition) => {
        set(
          recordGroupDefinitionFamilyState(updatedRecordGroup.id),
          updatedRecordGroup,
        );

        saveViewGroup(recordGroupDefinitionToViewGroup(updatedRecordGroup));

        // If visibility is manually toggled, we should reset the hideEmptyRecordGroup state
        set(objectOptionsDropdownRecordGroupHideState, false);
      },
    [objectOptionsDropdownRecordGroupHideState, saveViewGroup],
  );

  const handleHideEmptyRecordGroupChange = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const updatedRecordGroupDefinitions: RecordGroupDefinition[] = [];
        const recordGroupIds = getSnapshotValue(
          snapshot,
          recordIndexRecordGroupIdsState,
        );

        const currentHideState = getSnapshotValue(
          snapshot,
          objectOptionsDropdownRecordGroupHideState,
        );

        set(objectOptionsDropdownRecordGroupHideState, !currentHideState);

        for (const recordGroupId of recordGroupIds) {
          const recordGroup = getSnapshotValue(
            snapshot,
            recordGroupDefinitionFamilyState(recordGroupId),
          );
          const recordGroupRowIds = getSnapshotValue(
            snapshot,
            recordIndexRowIdsByGroupFamilyState(recordGroupId),
          );

          if (!isDefined(recordGroup) || recordGroupRowIds.length > 0) {
            continue;
          }

          const updatedRecordGroup = {
            ...recordGroup,
            isVisible: !currentHideState,
          };

          set(
            recordGroupDefinitionFamilyState(recordGroupId),
            updatedRecordGroup,
          );

          updatedRecordGroupDefinitions.push(updatedRecordGroup);
        }

        saveViewGroups(
          mapRecordGroupDefinitionsToViewGroups(updatedRecordGroupDefinitions),
        );
      },
    [
      recordIndexRecordGroupIdsState,
      objectOptionsDropdownRecordGroupHideState,
      saveViewGroups,
      recordGroupDefinitionFamilyState,
      recordIndexRowIdsByGroupFamilyState,
    ],
  );

  return {
    handleVisibilityChange,
    handleHideEmptyRecordGroupChange,
  };
};
