import { useRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { FilterSettings } from '@/workflow/workflow-steps/workflow-actions/filter-action/components/WorkflowEditActionFilter';
import { currentStepFilterGroupsComponentState } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/currentStepFilterGroupsComponentState';
import { currentStepFiltersComponentState } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/currentStepFiltersComponentState';
import { hasInitializedCurrentStepFilterGroupsComponentFamilyState } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/hasInitializedCurrentStepFilterGroupsComponentFamilyState';
import { hasInitializedCurrentStepFiltersComponentFamilyState } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/hasInitializedCurrentStepFiltersComponentFamilyState';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const WorkflowEditActionFilterBodyEffect = ({
  stepId,
  defaultValue,
}: {
  stepId: string;
  defaultValue?: FilterSettings;
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

  const setCurrentStepFilters = useSetRecoilComponentStateV2(
    currentStepFiltersComponentState,
  );

  const setCurrentStepFilterGroups = useSetRecoilComponentStateV2(
    currentStepFilterGroupsComponentState,
  );

  useEffect(() => {
    if (
      !hasInitializedCurrentStepFilters &&
      isDefined(defaultValue?.stepFilters)
    ) {
      setCurrentStepFilters(defaultValue.stepFilters ?? []);
      setHasInitializedCurrentStepFilters(true);
    }
  }, [
    setCurrentStepFilters,
    hasInitializedCurrentStepFilters,
    setHasInitializedCurrentStepFilters,
    defaultValue?.stepFilters,
  ]);

  useEffect(() => {
    if (
      !hasInitializedCurrentStepFilterGroups &&
      isDefined(defaultValue?.stepFilterGroups) &&
      defaultValue.stepFilterGroups.length > 0
    ) {
      setCurrentStepFilterGroups(defaultValue.stepFilterGroups ?? []);
      setHasInitializedCurrentStepFilterGroups(true);
    }
  }, [
    setCurrentStepFilterGroups,
    hasInitializedCurrentStepFilterGroups,
    setHasInitializedCurrentStepFilterGroups,
    defaultValue?.stepFilterGroups,
  ]);

  return null;
};
