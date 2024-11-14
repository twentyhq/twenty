import { objectOptionsDropdownRecordGroupHideComponentState } from '@/object-record/object-options-dropdown/states/objectOptionsDropdownRecordGroupHideComponentState';
import { recordGroupDefinitionsComponentState } from '@/object-record/record-group/states/recordGroupDefinitionsComponentState';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { useSaveCurrentViewGroups } from '@/views/hooks/useSaveCurrentViewGroups';
import { mapRecordGroupDefinitionsToViewGroups } from '@/views/utils/mapRecordGroupDefinitionsToViewGroups';
import { useRecoilCallback } from 'recoil';

type UseRecordGroupVisibilityParams = {
  viewBarId: string;
};

export const useRecordGroupVisibility = ({
  viewBarId,
}: UseRecordGroupVisibilityParams) => {
  const recordGroupDefinitionsState = useRecoilComponentCallbackStateV2(
    recordGroupDefinitionsComponentState,
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
          (groupDefinition) => {
            const recordGroupRowIds = get(snapshot, idsFamilly);
          },
        );
      },
    [objectOptionsDropdownRecordGroupHideState],
  );

  return {
    handleVisibilityChange,
    handleHideEmptyRecordGroupChange,
  };
};
