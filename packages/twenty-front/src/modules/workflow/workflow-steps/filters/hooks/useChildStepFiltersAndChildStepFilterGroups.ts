import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { currentStepFilterGroupsComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFilterGroupsComponentState';
import { currentStepFiltersComponentState } from '@/workflow/workflow-steps/filters/states/currentStepFiltersComponentState';
import { type StepFilter, type StepFilterGroup } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useChildStepFiltersAndChildStepFilterGroups = ({
  stepFilterGroupId,
}: {
  stepFilterGroupId: string;
}) => {
  const stepFilterGroups = useRecoilComponentValueV2(
    currentStepFilterGroupsComponentState,
  );

  const stepFilters = useRecoilComponentValueV2(
    currentStepFiltersComponentState,
  );

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
