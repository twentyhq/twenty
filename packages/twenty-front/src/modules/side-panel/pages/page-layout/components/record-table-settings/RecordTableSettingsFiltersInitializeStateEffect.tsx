import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { useSetAdvancedFilterDropdownStates } from '@/object-record/advanced-filter/hooks/useSetAdvancedFilterDropdownAllRowsStates';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { type View } from '@/views/types/View';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

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

  const currentRecordFilterGroups = useAtomComponentStateValue(
    currentRecordFilterGroupsComponentState,
  );

  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const [hasInitializedFilters, setHasInitializedFilters] = useState(false);

  const stateAlreadyHasFilters =
    currentRecordFilters.length > 0 || currentRecordFilterGroups.length > 0;

  useEffect(() => {
    if (hasInitializedFilters) {
      return;
    }

    if (stateAlreadyHasFilters) {
      setHasInitializedFilters(true);
      return;
    }

    const recordFilters = mapViewFiltersToFilters(
      view.viewFilters,
      flattenedFieldMetadataItems,
    );

    setCurrentRecordFilters(recordFilters);

    if (isDefined(view.viewFilterGroups) && view.viewFilterGroups.length > 0) {
      setCurrentRecordFilterGroups(
        mapViewFilterGroupsToRecordFilterGroups(view.viewFilterGroups),
      );
    }

    setHasInitializedFilters(true);
  }, [
    view,
    flattenedFieldMetadataItems,
    hasInitializedFilters,
    stateAlreadyHasFilters,
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
