import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { useSetAdvancedFilterDropdownStates } from '@/object-record/advanced-filter/hooks/useSetAdvancedFilterDropdownAllRowsStates';
import { attachUngroupedRecordFiltersToRootRecordFilterGroup } from '@/object-record/record-filter-group/utils/attachUngroupedRecordFiltersToRootRecordFilterGroup';
import { removeEmptyRecordFilterGroups } from '@/object-record/record-filter-group/utils/removeEmptyRecordFilterGroups';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { unresolvedRecordFiltersComponentState } from '@/object-record/record-filter/states/unresolvedRecordFiltersComponentState';
import { hydrateRecordFiltersFromFieldMetadata } from '@/object-record/record-filter/utils/hydrateRecordFiltersFromFieldMetadata';
import { pointRecordFiltersAtMorphRelationFields } from '@/object-record/record-filter/utils/pointRecordFiltersAtMorphRelationFields';
import { useAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { hasInitializedCurrentRecordFiltersComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFiltersComponentFamilyState';
import { type FindRecordsActionFilter } from '@/workflow/workflow-steps/workflow-actions/find-records-action/types/FindRecordsActionFilter';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const WorkflowFindRecordsFiltersEffect = ({
  defaultValue,
}: {
  defaultValue?: FindRecordsActionFilter;
}) => {
  const [
    hasInitializedCurrentRecordFilters,
    setHasInitializedCurrentRecordFilters,
  ] = useAtomComponentFamilyState(
    hasInitializedCurrentRecordFiltersComponentFamilyState,
    {},
  );

  const setCurrentRecordFilters = useSetAtomComponentState(
    currentRecordFiltersComponentState,
  );

  const setCurrentRecordFilterGroups = useSetAtomComponentState(
    currentRecordFilterGroupsComponentState,
  );

  const setUnresolvedRecordFilters = useSetAtomComponentState(
    unresolvedRecordFiltersComponentState,
  );

  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const { setAdvancedFilterDropdownStates } =
    useSetAdvancedFilterDropdownStates();

  const [
    shouldSetAdvancedFilterDropdownStates,
    setShouldSetAdvancedFilterDropdownStates,
  ] = useState(false);

  useEffect(() => {
    if (hasInitializedCurrentRecordFilters || !isDefined(defaultValue)) {
      return;
    }

    const { recordFilters: persistedRecordFilters, recordFilterGroups } =
      attachUngroupedRecordFiltersToRootRecordFilterGroup({
        recordFilters: pointRecordFiltersAtMorphRelationFields({
          recordFilters: defaultValue.recordFilters ?? [],
          fieldMetadataItems: flattenedFieldMetadataItems,
        }),
        recordFilterGroups: defaultValue.recordFilterGroups ?? [],
      });

    const { recordFilters, unresolvedRecordFilters } =
      hydrateRecordFiltersFromFieldMetadata({
        persistedRecordFilters,
        fieldMetadataItems: flattenedFieldMetadataItems,
      });

    setCurrentRecordFilters(recordFilters);
    setUnresolvedRecordFilters(unresolvedRecordFilters);
    setCurrentRecordFilterGroups(
      removeEmptyRecordFilterGroups({ recordFilters, recordFilterGroups }),
    );
    setShouldSetAdvancedFilterDropdownStates(true);
    setHasInitializedCurrentRecordFilters(true);
  }, [
    defaultValue,
    flattenedFieldMetadataItems,
    hasInitializedCurrentRecordFilters,
    setCurrentRecordFilterGroups,
    setCurrentRecordFilters,
    setHasInitializedCurrentRecordFilters,
    setUnresolvedRecordFilters,
  ]);

  useEffect(() => {
    if (shouldSetAdvancedFilterDropdownStates) {
      setAdvancedFilterDropdownStates();
      setShouldSetAdvancedFilterDropdownStates(false);
    }
  }, [shouldSetAdvancedFilterDropdownStates, setAdvancedFilterDropdownStates]);

  return null;
};
