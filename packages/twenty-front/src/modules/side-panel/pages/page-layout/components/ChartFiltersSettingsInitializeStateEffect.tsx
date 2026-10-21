import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { useSetAdvancedFilterDropdownStates } from '@/object-record/advanced-filter/hooks/useSetAdvancedFilterDropdownAllRowsStates';
import { attachUngroupedRecordFiltersToRootRecordFilterGroup } from '@/object-record/record-filter-group/utils/attachUngroupedRecordFiltersToRootRecordFilterGroup';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { unresolvedRecordFiltersComponentState } from '@/object-record/record-filter/states/unresolvedRecordFiltersComponentState';
import { hydrateRecordFiltersFromFieldMetadata } from '@/object-record/record-filter/utils/hydrateRecordFiltersFromFieldMetadata';
import { hasInitializedChartFiltersComponentState } from '@/side-panel/pages/page-layout/states/hasInitializedChartFiltersComponentState';
import { type ChartFilters } from '@/side-panel/pages/page-layout/types/ChartFilters';
import { pointRecordFiltersAtMorphRelationFields } from '@/object-record/record-filter/utils/pointRecordFiltersAtMorphRelationFields';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export type ChartFiltersSettingsInitializeStateEffectProps = {
  initialChartFilters?: ChartFilters;
};

export const ChartFiltersSettingsInitializeStateEffect = ({
  initialChartFilters,
}: ChartFiltersSettingsInitializeStateEffectProps) => {
  const [hasInitializedChartFilters, setHasInitializedChartFilters] =
    useAtomComponentState(hasInitializedChartFiltersComponentState);

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
    if (!hasInitializedChartFilters && isDefined(initialChartFilters)) {
      const { recordFilters: persistedRecordFilters, recordFilterGroups } =
        attachUngroupedRecordFiltersToRootRecordFilterGroup({
          recordFilters: pointRecordFiltersAtMorphRelationFields({
            recordFilters: initialChartFilters.recordFilters ?? [],
            fieldMetadataItems: flattenedFieldMetadataItems,
          }),
          recordFilterGroups: initialChartFilters.recordFilterGroups ?? [],
        });

      const { recordFilters, unresolvedRecordFilters } =
        hydrateRecordFiltersFromFieldMetadata({
          persistedRecordFilters,
          fieldMetadataItems: flattenedFieldMetadataItems,
        });

      setCurrentRecordFilters(recordFilters);
      setUnresolvedRecordFilters(unresolvedRecordFilters);
      setCurrentRecordFilterGroups(recordFilterGroups);

      setShouldSetAdvancedFilterDropdownStates(true);
      setHasInitializedChartFilters(true);
    }
  }, [
    setCurrentRecordFilters,
    setCurrentRecordFilterGroups,
    setUnresolvedRecordFilters,
    setHasInitializedChartFilters,
    hasInitializedChartFilters,
    initialChartFilters,
    flattenedFieldMetadataItems,
  ]);

  useEffect(() => {
    if (shouldSetAdvancedFilterDropdownStates) {
      setAdvancedFilterDropdownStates();
      setShouldSetAdvancedFilterDropdownStates(false);
    }
  }, [shouldSetAdvancedFilterDropdownStates, setAdvancedFilterDropdownStates]);

  return null;
};
