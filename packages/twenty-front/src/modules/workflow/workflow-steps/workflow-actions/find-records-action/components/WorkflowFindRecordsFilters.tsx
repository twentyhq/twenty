import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

import { AdvancedFilterCommandMenuContainer } from '@/object-record/advanced-filter/command-menu/components/AdvancedFilterCommandMenuContainer';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

import { type FindRecordsActionFilter } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowEditActionFindRecords';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';

import { useRecoilCallback } from 'recoil';

export const WorkflowFindRecordsFilters = ({
  objectMetadataItem,
  onChange,
  readonly,
}: {
  objectMetadataItem: ObjectMetadataItem;
  onChange: (filter: FindRecordsActionFilter) => void;
  readonly?: boolean;
}) => {
  const currentRecordFilterGroupsCallbackState =
    useRecoilComponentCallbackState(currentRecordFilterGroupsComponentState);

  const currentRecordFiltersCallbackState = useRecoilComponentCallbackState(
    currentRecordFiltersComponentState,
  );

  const onUpdate = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const currentRecordFilterGroups = getSnapshotValue(
          snapshot,
          currentRecordFilterGroupsCallbackState,
        );

        const currentRecordFilters = getSnapshotValue(
          snapshot,
          currentRecordFiltersCallbackState,
        );

        const newFilter = {
          recordFilterGroups: currentRecordFilterGroups,
          recordFilters: currentRecordFilters,
        } satisfies FindRecordsActionFilter;

        onChange(newFilter);
      },
    [
      currentRecordFilterGroupsCallbackState,
      currentRecordFiltersCallbackState,
      onChange,
    ],
  );

  return (
    <AdvancedFilterCommandMenuContainer
      objectMetadataItem={objectMetadataItem}
      onUpdate={readonly ? undefined : onUpdate}
      VariablePicker={WorkflowVariablePicker}
      readonly={readonly}
      isWorkflowFindRecords={true}
    />
  );
};
