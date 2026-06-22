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

// Seeds the builder's local atoms from the persisted `defaultValue`, and
// re-seeds them only when `defaultValue` itself changes (e.g. switching the
// trigger / action being edited). The atoms are module-cached per `instanceId`
// and persist across mounts — the trigger even shares one constant `instanceId`
// — so a value from a previous edit has to be overwritten when a different
// `defaultValue` comes in.
//
// We track the last *synced* `defaultValue` (not the live atoms) and resync only
// when it changes. A local edit writes the atoms synchronously and then persists
// through an async mutation, so for a short window the atoms are ahead of the
// still-stale `defaultValue`. Comparing the atoms against `defaultValue` — as we
// used to — treated that window as "out of sync" and overwrote the edit back to
// the stale value, then wrote it again once the save landed, making the
// just-added condition flash out and back in.
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
