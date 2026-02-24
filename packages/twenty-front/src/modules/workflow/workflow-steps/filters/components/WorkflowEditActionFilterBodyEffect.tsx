import { useRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { currentStepFilterGroupsComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFilterGroupsComponentState';
import { currentStepFiltersComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFiltersComponentState';
import { hasInitializedCurrentStepFilterGroupsComponentFamilyState } from '@/workflow/workflow-steps/filters/states/hasInitializedCurrentStepFilterGroupsComponentFamilyState';
import { hasInitializedCurrentStepFiltersComponentFamilyState } from '@/workflow/workflow-steps/filters/states/hasInitializedCurrentStepFiltersComponentFamilyState';
import { useEffect, useMemo } from 'react';
import {
  type StepFilterGroup,
  type StepFilterWithPotentiallyDeprecatedOperand,
} from 'twenty-shared/types';
import {
  convertViewFilterOperandToCoreOperand,
  isDefined,
} from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type FilterSettingsWithPotentiallyDeprecatedOperand = {
  stepFilterGroups?: StepFilterGroup[];
  stepFilters?: StepFilterWithPotentiallyDeprecatedOperand[];
};

export const WorkflowEditActionFilterBodyEffect = ({
  stepId,
  defaultValue,
}: {
  stepId: string;
  defaultValue?: FilterSettingsWithPotentiallyDeprecatedOperand;
}) => {
  const [
    hasInitializedCurrentStepFilters,
    setHasInitializedCurrentStepFilters,
  ] = useRecoilComponentFamilyStateV2(
    hasInitializedCurrentStepFiltersComponentFamilyState,
    { stepId },
  );

  const [
    hasInitializedCurrentStepFilterGroups,
    setHasInitializedCurrentStepFilterGroups,
  ] = useRecoilComponentFamilyStateV2(
    hasInitializedCurrentStepFilterGroupsComponentFamilyState,
    { stepId },
  );

  const currentStepFilters = useRecoilComponentValueV2(
    currentStepFiltersComponentState,
  );
  const currentStepFilterGroups = useRecoilComponentValueV2(
    currentStepFilterGroupsComponentState,
  );

  const setCurrentStepFilters = useSetRecoilComponentStateV2(
    currentStepFiltersComponentState,
  );

  const setCurrentStepFilterGroups = useSetRecoilComponentStateV2(
    currentStepFilterGroupsComponentState,
  );

  const stepFiltersConverted = useMemo(() => {
    return defaultValue?.stepFilters?.map((filter) => ({
      ...filter,
      operand: convertViewFilterOperandToCoreOperand(filter.operand),
    }));
  }, [defaultValue?.stepFilters]);

  useEffect(() => {
    if (!isDefined(stepFiltersConverted)) {
      return;
    }

    if (
      hasInitializedCurrentStepFilters &&
      isDeeplyEqual(currentStepFilters, stepFiltersConverted)
    ) {
      return;
    }

    setCurrentStepFilters(stepFiltersConverted ?? []);

    if (!hasInitializedCurrentStepFilters) {
      setHasInitializedCurrentStepFilters(true);
    }
  }, [
    setCurrentStepFilters,
    hasInitializedCurrentStepFilters,
    setHasInitializedCurrentStepFilters,
    stepFiltersConverted,
    currentStepFilters,
  ]);

  useEffect(() => {
    if (!isDefined(defaultValue?.stepFilterGroups)) {
      return;
    }

    if (
      !hasInitializedCurrentStepFilterGroups &&
      defaultValue.stepFilterGroups.length === 0
    ) {
      return;
    }

    if (
      hasInitializedCurrentStepFilterGroups &&
      isDeeplyEqual(
        currentStepFilterGroups,
        defaultValue.stepFilterGroups ?? [],
      )
    ) {
      return;
    }

    setCurrentStepFilterGroups(defaultValue.stepFilterGroups ?? []);

    if (!hasInitializedCurrentStepFilterGroups) {
      setHasInitializedCurrentStepFilterGroups(true);
    }
  }, [
    setCurrentStepFilterGroups,
    hasInitializedCurrentStepFilterGroups,
    setHasInitializedCurrentStepFilterGroups,
    defaultValue?.stepFilterGroups,
    currentStepFilterGroups,
  ]);

  return null;
};
