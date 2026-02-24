import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

import { AdvancedFilterCommandMenuContainer } from '@/object-record/advanced-filter/command-menu/components/AdvancedFilterCommandMenuContainer';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';

import { type FindRecordsActionFilter } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowEditActionFindRecords';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';

import { useStore } from 'jotai';
import { useCallback } from 'react';

export const WorkflowFindRecordsFilters = ({
  objectMetadataItem,
  onChange,
  readonly,
}: {
  objectMetadataItem: ObjectMetadataItem;
  onChange: (filter: FindRecordsActionFilter) => void;
  readonly?: boolean;
}) => {
  const currentRecordFilterGroupsAtom = useRecoilComponentStateCallbackStateV2(
    currentRecordFilterGroupsComponentState,
  );

  const currentRecordFiltersAtom = useRecoilComponentStateCallbackStateV2(
    currentRecordFiltersComponentState,
  );

  const store = useStore();

  const onUpdate = useCallback(() => {
    const currentRecordFilterGroups = store.get(currentRecordFilterGroupsAtom);

    const currentRecordFilters = store.get(currentRecordFiltersAtom);

    const newFilter = {
      recordFilterGroups: currentRecordFilterGroups,
      recordFilters: currentRecordFilters,
    } satisfies FindRecordsActionFilter;

    onChange(newFilter);
  }, [
    currentRecordFilterGroupsAtom,
    currentRecordFiltersAtom,
    onChange,
    store,
  ]);

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
