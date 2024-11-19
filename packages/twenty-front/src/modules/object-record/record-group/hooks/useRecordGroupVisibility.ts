import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { recordGroupDefinitionsComponentState } from '@/object-record/record-group/states/recordGroupDefinitionsComponentState';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexRecordGroupHideComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupHideComponentState';
import { tableRowIdsByGroupComponentFamilyState } from '@/object-record/record-table/states/tableRowIdsByGroupComponentFamilyState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useSaveCurrentViewGroups } from '@/views/hooks/useSaveCurrentViewGroups';
import { ViewType } from '@/views/types/ViewType';
import { mapRecordGroupDefinitionsToViewGroups } from '@/views/utils/mapRecordGroupDefinitionsToViewGroups';
import { useRecoilCallback } from 'recoil';

type UseRecordGroupVisibilityParams = {
  viewBarId: string;
  viewType: ViewType;
};

export const useRecordGroupVisibility = ({
  viewBarId,
  viewType,
}: UseRecordGroupVisibilityParams) => {
  const recordGroupDefinitionsState = useRecoilComponentCallbackStateV2(
    recordGroupDefinitionsComponentState,
  );

  const tableRowIdsByGroupFamilyState = useRecoilComponentCallbackStateV2(
    tableRowIdsByGroupComponentFamilyState,
    viewBarId,
  );

  const { recordIdsByColumnIdFamilyState } = useRecordBoardStates(viewBarId);

  const objectOptionsDropdownRecordGroupHideState =
    useRecoilComponentCallbackStateV2(recordIndexRecordGroupHideComponentState);

  const { saveViewGroups } = useSaveCurrentViewGroups(viewBarId);

  const handleVisibilityChange = useRecoilCallback(
    ({ snapshot, set }) =>
      async (updatedRecordGroupDefinition: RecordGroupDefinition) => {
        const recordGroupDefinitions = getSnapshotValue(
          snapshot,
          recordGroupDefinitionsState,
        );

        const updatedRecordGroupDefinitions = recordGroupDefinitions.map(
          (groupDefinition) =>
            groupDefinition.id === updatedRecordGroupDefinition.id
              ? {
                  ...groupDefinition,
                  isVisible: !groupDefinition.isVisible,
                }
              : groupDefinition,
        );

        set(recordGroupDefinitionsState, updatedRecordGroupDefinitions);

        saveViewGroups(
          mapRecordGroupDefinitionsToViewGroups(updatedRecordGroupDefinitions),
        );

        // If visibility is manually toggled, we should reset the hideEmptyRecordGroup state
        set(objectOptionsDropdownRecordGroupHideState, false);
      },
    [
      objectOptionsDropdownRecordGroupHideState,
      recordGroupDefinitionsState,
      saveViewGroups,
    ],
  );

  const handleHideEmptyRecordGroupChange = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const recordGroupDefinitions = getSnapshotValue(
          snapshot,
          recordGroupDefinitionsState,
        );

        const currentHideState = getSnapshotValue(
          snapshot,
          objectOptionsDropdownRecordGroupHideState,
        );

        set(objectOptionsDropdownRecordGroupHideState, !currentHideState);

        const updatedRecordGroupDefinitions = recordGroupDefinitions.map(
          (recordGroup) => {
            // TODO: Maybe we can improve that and only use one state for both table and board
            const recordGroupRowIds =
              viewType === ViewType.Table
                ? getSnapshotValue(
                    snapshot,
                    tableRowIdsByGroupFamilyState(recordGroup.id),
                  )
                : getSnapshotValue(
                    snapshot,
                    recordIdsByColumnIdFamilyState(recordGroup.id),
                  );

            if (recordGroupRowIds.length > 0) {
              return recordGroup;
            }

            return {
              ...recordGroup,
              isVisible: currentHideState,
            };
          },
        );

        saveViewGroups(
          mapRecordGroupDefinitionsToViewGroups(updatedRecordGroupDefinitions),
        );
      },
    [
      recordGroupDefinitionsState,
      objectOptionsDropdownRecordGroupHideState,
      saveViewGroups,
      viewType,
      tableRowIdsByGroupFamilyState,
      recordIdsByColumnIdFamilyState,
    ],
  );

  return {
    handleVisibilityChange,
    handleHideEmptyRecordGroupChange,
  };
};
