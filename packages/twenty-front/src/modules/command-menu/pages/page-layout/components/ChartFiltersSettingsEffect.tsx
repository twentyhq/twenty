import { type ChartFilters } from '@/command-menu/pages/page-layout/types/ChartFilters';
import { useSetAdvancedFilterDropdownStates } from '@/object-record/advanced-filter/hooks/useSetAdvancedFilterDropdownAllRowsStates';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecoilComponentFamilyState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { hasInitializedCurrentRecordFilterGroupsComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFilterGroupsComponentFamilyState';
import { hasInitializedCurrentRecordFiltersComponentFamilyState } from '@/views/states/hasInitializedCurrentRecordFiltersComponentFamilyState';
import { isNonEmptyArray } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const ChartFiltersSettingsEffect = ({
  initialFilterValue,
}: {
  initialFilterValue?: ChartFilters;
}) => {
  const [
    hasInitializedCurrentRecordFilters,
    setHasInitializedCurrentRecordFilters,
  ] = useRecoilComponentFamilyState(
    hasInitializedCurrentRecordFiltersComponentFamilyState,
    {},
  );

  const [
    hasInitializedCurrentRecordFilterGroups,
    setHasInitializedCurrentRecordFilterGroups,
  ] = useRecoilComponentFamilyState(
    hasInitializedCurrentRecordFilterGroupsComponentFamilyState,
    {},
  );

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
    if (
      !hasInitializedCurrentRecordFilters &&
      isDefined(initialFilterValue?.recordFilters)
    ) {
      setCurrentRecordFilters(initialFilterValue.recordFilters);
      setShouldSetAdvancedFilterDropdownStates(true);
      setHasInitializedCurrentRecordFilters(true);
    }
  }, [
    setCurrentRecordFilters,
    hasInitializedCurrentRecordFilters,
    setHasInitializedCurrentRecordFilters,
    initialFilterValue?.recordFilters,
  ]);

  useEffect(() => {
    if (
      !hasInitializedCurrentRecordFilterGroups &&
      isNonEmptyArray(initialFilterValue?.recordFilterGroups) &&
      initialFilterValue.recordFilterGroups.length > 0
    ) {
      setCurrentRecordFilterGroups(initialFilterValue.recordFilterGroups ?? []);
      setHasInitializedCurrentRecordFilterGroups(true);
    }
  }, [
    setCurrentRecordFilterGroups,
    hasInitializedCurrentRecordFilterGroups,
    setHasInitializedCurrentRecordFilterGroups,
    initialFilterValue?.recordFilterGroups,
  ]);

  useEffect(() => {
    if (shouldSetAdvancedFilterDropdownStates) {
      setAdvancedFilterDropdownStates();
      setShouldSetAdvancedFilterDropdownStates(false);
    }
  }, [shouldSetAdvancedFilterDropdownStates, setAdvancedFilterDropdownStates]);

  return null;
};
