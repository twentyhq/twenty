import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

import { AdvancedFilterSidePanelContainer } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelContainer';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { dehydrateRecordFilters } from '@/object-record/record-filter/utils/dehydrateRecordFilters';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

import { WorkflowFindRecordsDeletedFieldsWarning } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowFindRecordsDeletedFieldsWarning';
import { type FindRecordsActionFilter } from '@/workflow/workflow-steps/workflow-actions/find-records-action/types/FindRecordsActionFilter';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';

import { useStore } from 'jotai';
import { useCallback } from 'react';

export const WorkflowFindRecordsFilters = ({
  objectMetadataItem,
  onChange,
  readonly,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  onChange: (filter: FindRecordsActionFilter) => void;
  readonly?: boolean;
}) => {
  const currentRecordFilterGroups = useAtomComponentStateCallbackState(
    currentRecordFilterGroupsComponentState,
  );

  const currentRecordFilters = useAtomComponentStateCallbackState(
    currentRecordFiltersComponentState,
  );

  const store = useStore();

  const onUpdate = useCallback(() => {
    const existingRecordFilterGroups = store.get(currentRecordFilterGroups);

    const existingRecordFilters = store.get(currentRecordFilters);

    const newFilter = {
      recordFilterGroups: existingRecordFilterGroups,
      recordFilters: dehydrateRecordFilters(existingRecordFilters),
    } satisfies FindRecordsActionFilter;

    onChange(newFilter);
  }, [currentRecordFilterGroups, currentRecordFilters, onChange, store]);

  return (
    <>
      {!readonly && <WorkflowFindRecordsDeletedFieldsWarning />}
      <AdvancedFilterSidePanelContainer
        objectMetadataItem={objectMetadataItem}
        onUpdate={readonly ? undefined : onUpdate}
        VariablePicker={WorkflowVariablePicker}
        readonly={readonly}
        isWorkflowFindRecords={true}
      />
    </>
  );
};
