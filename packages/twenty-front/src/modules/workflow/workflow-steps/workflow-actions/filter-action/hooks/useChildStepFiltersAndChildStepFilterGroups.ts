import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { currentStepFilterGroupsComponentState } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/currentStepFilterGroupsComponentState';
import { currentStepFiltersComponentState } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/currentStepFiltersComponentState';
import { StepFilter, StepFilterGroup } from 'twenty-shared/src/types';
import { isDefined } from 'twenty-shared/utils';

export const useChildStepFiltersAndChildStepFilterGroups = ({
  stepFilterGroupId,
}: {
  stepFilterGroupId: string;
}) => {
  const stepFilterGroups = useRecoilComponentValue(
    currentStepFilterGroupsComponentState,
  );

  const stepFilters = useRecoilComponentValue(currentStepFiltersComponentState);

  const currentStepFilterGroup = stepFilterGroups?.find(
    (stepFilterGroup) => stepFilterGroup.id === stepFilterGroupId,
  );

  if (!isDefined(currentStepFilterGroup)) {
    return {
      currentStepFilterGroup: undefined,
      childStepFiltersAndChildStepFilterGroups: [] as Array<
        StepFilter | StepFilterGroup
      >,
      childStepFilters: [] as StepFilter[],
      childStepFilterGroups: [] as StepFilterGroup[],
      lastChildPosition: 0,
    };
  }

  const childStepFilters = stepFilters?.filter(
    (filter) => filter.stepFilterGroupId === currentStepFilterGroup.id,
  );

  const childStepFilterGroups = stepFilterGroups?.filter(
    (filterGroup) =>
      filterGroup.parentStepFilterGroupId === currentStepFilterGroup.id,
  );

  const childStepFiltersAndChildStepFilterGroups = [
    ...(childStepFilterGroups ?? []),
    ...(childStepFilters ?? []),
  ].sort((a, b) => {
    const positionA = a.positionInStepFilterGroup ?? 0;
    const positionB = b.positionInStepFilterGroup ?? 0;
    return positionA - positionB;
  });

  const lastChildPosition =
    childStepFiltersAndChildStepFilterGroups[
      childStepFiltersAndChildStepFilterGroups.length - 1
    ]?.positionInStepFilterGroup ?? 0;

  return {
    currentStepFilterGroup,
    childStepFiltersAndChildStepFilterGroups,
    childStepFilters,
    childStepFilterGroups,
    lastChildPosition,
  };
};
