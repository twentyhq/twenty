import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { useSetAdvancedFilterDropdownStates } from '@/object-record/advanced-filter/hooks/useSetAdvancedFilterDropdownAllRowsStates';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { isCurrentRecordViewFilter } from '@/page-layout/widgets/record-table/utils/isCurrentRecordViewFilter';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { type View } from '@/views/types/View';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { useEffect, useState } from 'react';

type RecordTableSettingsFiltersInitializeStateEffectProps = {
  view: View;
};

export const RecordTableSettingsFiltersInitializeStateEffect = ({
  view,
}: RecordTableSettingsFiltersInitializeStateEffectProps) => {
  const setCurrentRecordFilters = useSetAtomComponentState(
    currentRecordFiltersComponentState,
  );

  const setCurrentRecordFilterGroups = useSetAtomComponentState(
    currentRecordFilterGroupsComponentState,
  );

  const { setAdvancedFilterDropdownStates } =
    useSetAdvancedFilterDropdownStates();

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const [hasInitializedFilters, setHasInitializedFilters] = useState(false);

  // The editor state outlives the sub-page (record pages key it apart from the live widget), so reseed it on every open
  useEffect(() => {
    if (hasInitializedFilters) {
      return;
    }

    setCurrentRecordFilters(
      mapViewFiltersToFilters(
        view.viewFilters.filter(
          (viewFilter) => !isCurrentRecordViewFilter(viewFilter),
        ),
        flattenedFieldMetadataItems,
      ),
    );
    setCurrentRecordFilterGroups(
      mapViewFilterGroupsToRecordFilterGroups(view.viewFilterGroups ?? []),
    );
    setHasInitializedFilters(true);
  }, [
    view,
    flattenedFieldMetadataItems,
    hasInitializedFilters,
    setCurrentRecordFilters,
    setCurrentRecordFilterGroups,
  ]);

  useEffect(() => {
    if (!hasInitializedFilters) {
      return;
    }

    setAdvancedFilterDropdownStates();
  }, [
    currentRecordFilters,
    hasInitializedFilters,
    setAdvancedFilterDropdownStates,
  ]);

  return null;
};
