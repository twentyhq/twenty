import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexRecordGroupHideComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordGroupHideComponentFamilyState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useSaveCurrentViewGroups } from '@/views/hooks/useSaveCurrentViewGroups';
import { ViewType } from '@/views/types/ViewType';
import { recordGroupDefinitionToViewGroup } from '@/views/utils/recordGroupDefinitionToViewGroup';
import { useRecoilCallback } from 'recoil';

type UseRecordGroupVisibilityParams = {
  viewType: ViewType;
};

export const useRecordGroupVisibility = ({
  viewType,
}: UseRecordGroupVisibilityParams) => {
  const objectOptionsDropdownRecordGroupHideFamilyState =
    useRecoilComponentCallbackState(
      recordIndexRecordGroupHideComponentFamilyState,
    );

  const { saveViewGroup } = useSaveCurrentViewGroups();

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
