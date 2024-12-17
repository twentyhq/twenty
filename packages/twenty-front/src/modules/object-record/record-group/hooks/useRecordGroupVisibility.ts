import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexRecordGroupHideComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupHideComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useSaveCurrentViewGroups } from '@/views/hooks/useSaveCurrentViewGroups';
import { recordGroupDefinitionToViewGroup } from '@/views/utils/recordGroupDefinitionToViewGroup';
import { useRecoilCallback } from 'recoil';

type UseRecordGroupVisibilityParams = {
  viewBarId: string;
};

export const useRecordGroupVisibility = ({
  viewBarId,
}: UseRecordGroupVisibilityParams) => {
  const objectOptionsDropdownRecordGroupHideState =
    useRecoilComponentCallbackStateV2(recordIndexRecordGroupHideComponentState);

  const { saveViewGroup } = useSaveCurrentViewGroups(viewBarId);

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
    ({ set }) =>
      async () => {
        set(
          objectOptionsDropdownRecordGroupHideState,
          (currentHideState) => !currentHideState,
        );
      },
    [objectOptionsDropdownRecordGroupHideState],
  );

  return {
    handleVisibilityChange,
    handleHideEmptyRecordGroupChange,
  };
};
