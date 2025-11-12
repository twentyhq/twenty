import { hasInitializedChartFiltersComponentState } from '@/command-menu/pages/page-layout/states/hasInitializedChartFiltersComponentState';
import { type ChartFilters } from '@/command-menu/pages/page-layout/types/ChartFilters';
import { useSetAdvancedFilterDropdownStates } from '@/object-record/advanced-filter/hooks/useSetAdvancedFilterDropdownAllRowsStates';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export type ChartFiltersSettingsInitializeStateEffectProps = {
  initialChartFilters?: ChartFilters;
};

export const ChartFiltersSettingsInitializeStateEffect = ({
  initialChartFilters,
}: ChartFiltersSettingsInitializeStateEffectProps) => {
  const [hasInitializedChartFilters, setHasInitializedChartFilters] =
    useRecoilComponentState(hasInitializedChartFiltersComponentState);

  const setCurrentRecordFilters = useSetRecoilComponentState(
    currentRecordFiltersComponentState,
  );

  const setCurrentRecordFilterGroups = useSetRecoilComponentState(
    currentRecordFilterGroupsComponentState,
  );

  const { setAdvancedFilterDropdownStates } =
    useSetAdvancedFilterDropdownStates();

  const [
    shouldSetAdvancedFilterDropdownStates,
    setShouldSetAdvancedFilterDropdownStates,
  ] = useState(false);

  useEffect(() => {
    if (!hasInitializedChartFilters && isDefined(initialChartFilters)) {
      setCurrentRecordFilters(initialChartFilters.recordFilters ?? []);
      setCurrentRecordFilterGroups(
        initialChartFilters.recordFilterGroups ?? [],
      );

      setShouldSetAdvancedFilterDropdownStates(true);
      setHasInitializedChartFilters(true);
    }
  }, [
    setCurrentRecordFilters,
    setCurrentRecordFilterGroups,
    setHasInitializedChartFilters,
    hasInitializedChartFilters,
    initialChartFilters,
  ]);

  useEffect(() => {
    if (shouldSetAdvancedFilterDropdownStates) {
      setAdvancedFilterDropdownStates();
      setShouldSetAdvancedFilterDropdownStates(false);
    }
  }, [shouldSetAdvancedFilterDropdownStates, setAdvancedFilterDropdownStates]);

  return null;
};
