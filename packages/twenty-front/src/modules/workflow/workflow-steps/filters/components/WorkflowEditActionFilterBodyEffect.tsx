import { useRecoilComponentFamilyState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
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
  ] = useRecoilComponentFamilyState(
    hasInitializedCurrentStepFiltersComponentFamilyState,
    { stepId },
  );

  const [
    hasInitializedCurrentStepFilterGroups,
    setHasInitializedCurrentStepFilterGroups,
  ] = useRecoilComponentFamilyState(
    hasInitializedCurrentStepFilterGroupsComponentFamilyState,
    { stepId },
  );

  const currentStepFilters = useRecoilComponentValue(
    currentStepFiltersComponentState,
  );
  const currentStepFilterGroups = useRecoilComponentValue(
    currentStepFilterGroupsComponentState,
  );

  const setCurrentStepFilters = useSetRecoilComponentState(
    currentStepFiltersComponentState,
  );

  const setCurrentStepFilterGroups = useSetRecoilComponentState(
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
