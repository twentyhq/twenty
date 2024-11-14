import { objectOptionsDropdownRecordGroupHideComponentState } from '@/object-record/object-options-dropdown/states/objectOptionsDropdownRecordGroupHideComponentState';
import { recordBoardRecordIdsByColumnIdComponentFamilyState } from '@/object-record/record-board/states/recordBoardRecordIdsByColumnIdComponentFamilyState';
import { recordGroupDefinitionsComponentState } from '@/object-record/record-group/states/recordGroupDefinitionsComponentState';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { tableRowIdsByGroupComponentFamilyState } from '@/object-record/record-table/states/tableRowIdsByGroupComponentFamilyState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { extractComponentFamilyState } from '@/ui/utilities/state/component-state/utils/extractComponentFamilyState';
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

  const boardRowIdsByGroupFamilyState = extractComponentFamilyState(
    recordBoardRecordIdsByColumnIdComponentFamilyState,
    viewBarId,
  );

  const objectOptionsDropdownRecordGroupHideState =
    useRecoilComponentCallbackStateV2(
      objectOptionsDropdownRecordGroupHideComponentState,
    );

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
            const recordGroupRowIds =
              viewType === ViewType.Kanban
                ? getSnapshotValue(
                    snapshot,
                    tableRowIdsByGroupFamilyState(recordGroup.id),
                  )
                : getSnapshotValue(
                    snapshot,
                    boardRowIdsByGroupFamilyState(recordGroup.id),
                  );

            console.log('recordGroupRowIds', recordGroupRowIds);

            if (recordGroupRowIds.length > 0) {
              return recordGroup;
            }

            return {
              ...recordGroup,
              isVisible: false,
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
      boardRowIdsByGroupFamilyState,
    ],
  );

  return {
    handleVisibilityChange,
    handleHideEmptyRecordGroupChange,
  };
};
