import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexRecordGroupHideComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordGroupHideComponentFamilyState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useSaveCurrentViewGroups } from '@/views/hooks/useSaveCurrentViewGroups';
import { ViewType } from '@/views/types/ViewType';
import { recordGroupDefinitionToViewGroup } from '@/views/utils/recordGroupDefinitionToViewGroup';
import { useRecoilCallback } from 'recoil';

type UseRecordGroupVisibilityParams = {
  viewBarId: string;
  viewType: ViewType;
};

export const useRecordGroupVisibility = ({
  viewBarId,
  viewType,
}: UseRecordGroupVisibilityParams) => {
  const objectOptionsDropdownRecordGroupHideFamilyState =
    useRecoilComponentCallbackStateV2(
      recordIndexRecordGroupHideComponentFamilyState,
    );

  const { saveViewGroup } = useSaveCurrentViewGroups(viewBarId);

  const handleVisibilityChange = useRecoilCallback(
    ({ set }) =>
      async (updatedRecordGroup: RecordGroupDefinition) => {
        set(
          recordGroupDefinitionFamilyState(updatedRecordGroup.id),
          updatedRecordGroup,
        );

        saveViewGroup(recordGroupDefinitionToViewGroup(updatedRecordGroup));
      },
    [saveViewGroup],
  );

  const handleHideEmptyRecordGroupChange = useRecoilCallback(
    ({ set }) =>
      async () => {
        set(
          objectOptionsDropdownRecordGroupHideFamilyState(viewType),
          (currentHideState) => !currentHideState,
        );
      },
    [viewType, objectOptionsDropdownRecordGroupHideFamilyState],
  );

  return {
    handleVisibilityChange,
    handleHideEmptyRecordGroupChange,
  };
};
