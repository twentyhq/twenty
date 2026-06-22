import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { currentStepFilterGroupsComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFilterGroupsComponentState';
import { currentStepFiltersComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFiltersComponentState';
import { type FilterSettingsWithPotentiallyDeprecatedOperand } from '@/workflow/workflow-steps/filters/types/FilterSettings';
import { useEffect, useMemo, useState } from 'react';
import {
  convertViewFilterOperandToCoreOperand,
  isDefined,
} from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const WorkflowEditActionFilterBodyEffect = ({
  defaultValue,
}: {
  defaultValue?: FilterSettingsWithPotentiallyDeprecatedOperand;
}) => {
  const setCurrentStepFilters = useSetAtomComponentState(
    currentStepFiltersComponentState,
  );

  const setCurrentStepFilterGroups = useSetAtomComponentState(
    currentStepFilterGroupsComponentState,
  );

  const stepFiltersConverted = useMemo(() => {
    return defaultValue?.stepFilters?.map((filter) => ({
      ...filter,
      operand: convertViewFilterOperandToCoreOperand(filter.operand),
    }));
  }, [defaultValue?.stepFilters]);

  const stepFilterGroups = defaultValue?.stepFilterGroups;

  const [lastSyncedStepFilters, setLastSyncedStepFilters] =
    useState<typeof stepFiltersConverted>(undefined);

  const [lastSyncedStepFilterGroups, setLastSyncedStepFilterGroups] =
    useState<typeof stepFilterGroups>(undefined);

  useEffect(() => {
    if (!isDefined(stepFiltersConverted)) {
      return;
    }

    if (isDeeplyEqual(lastSyncedStepFilters, stepFiltersConverted)) {
      return;
    }

    setLastSyncedStepFilters(stepFiltersConverted);
    setCurrentStepFilters(stepFiltersConverted);
  }, [
    stepFiltersConverted,
    lastSyncedStepFilters,
    setCurrentStepFilters,
    setLastSyncedStepFilters,
  ]);

  useEffect(() => {
    if (!isDefined(stepFilterGroups)) {
      return;
    }

    if (isDeeplyEqual(lastSyncedStepFilterGroups, stepFilterGroups)) {
      return;
    }

    setLastSyncedStepFilterGroups(stepFilterGroups);
    setCurrentStepFilterGroups(stepFilterGroups);
  }, [
    stepFilterGroups,
    lastSyncedStepFilterGroups,
    setCurrentStepFilterGroups,
    setLastSyncedStepFilterGroups,
  ]);

  return null;
};
