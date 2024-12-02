import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexRecordGroupHideComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupHideComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
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

  const recordIndexRecordIdsByGroupFamilyState =
    useRecoilComponentCallbackStateV2(
      recordIndexRecordIdsByGroupComponentFamilyState,
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
    [saveViewGroup, objectOptionsDropdownRecordGroupHideState],
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
        const newHideState = !currentHideState;

        set(objectOptionsDropdownRecordGroupHideState, newHideState);

        for (const recordGroupId of recordGroupIds) {
          const recordGroup = getSnapshotValue(
            snapshot,
            recordGroupDefinitionFamilyState(recordGroupId),
          );

          if (!isDefined(recordGroup)) {
            throw new Error(
              `Record group with id ${recordGroupId} not found in snapshot`,
            );
          }

          const recordGroupRowIds = getSnapshotValue(
            snapshot,
            recordIndexRecordIdsByGroupFamilyState(recordGroupId),
          );

          if (recordGroupRowIds.length > 0) {
            continue;
          }

          const updatedRecordGroup = {
            ...recordGroup,
            isVisible: !newHideState,
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
      recordIndexRecordIdsByGroupFamilyState,
    ],
  );

  return {
    handleVisibilityChange,
    handleHideEmptyRecordGroupChange,
  };
};
