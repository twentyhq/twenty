import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useSetAdvancedFilterDropdownStates } from '@/object-record/advanced-filter/hooks/useSetAdvancedFilterDropdownAllRowsStates';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { type View } from '@/views/types/View';
import { getFilterableFields } from '@/views/utils/getFilterableFields';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type RecordTableSettingsFiltersInitializeStateEffectProps = {
  view: View;
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const RecordTableSettingsFiltersInitializeStateEffect = ({
  view,
  objectMetadataItem,
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

    const filterableFields = getFilterableFields(objectMetadataItem);
    const recordFilters = mapViewFiltersToFilters(
      view.viewFilters,
      filterableFields,
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
    objectMetadataItem,
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
