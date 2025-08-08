import { useRecoilComponentFamilyState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
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

  const setCurrentStepFilters = useSetRecoilComponentState(
    currentStepFiltersComponentState,
  );

  const setCurrentStepFilterGroups = useSetRecoilComponentState(
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
