import { StepFilter, StepFilterGroup } from 'twenty-shared/src/types';
import { isDefined } from 'twenty-shared/utils';

export const getChildStepFiltersAndChildStepFilterGroups = ({
  stepFilterGroupId,
  stepFilterGroups,
  stepFilters,
}: {
  stepFilterGroupId: string;
  stepFilterGroups?: StepFilterGroup[];
  stepFilters?: StepFilter[];
}) => {
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
    (stepFilterToFilter) =>
      stepFilterToFilter.stepFilterGroupId === currentStepFilterGroup.id,
  );

  const childStepFilterGroups = stepFilterGroups?.filter(
    (currentStepFilterGroupToFilter) =>
      currentStepFilterGroupToFilter.parentStepFilterGroupId ===
      currentStepFilterGroup.id,
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
