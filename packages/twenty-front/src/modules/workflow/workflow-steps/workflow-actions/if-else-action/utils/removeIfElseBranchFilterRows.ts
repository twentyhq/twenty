import { type StepFilter, type StepFilterGroup } from 'twenty-shared/types';

// Keeps the branch's own group, which marks it as a conditional branch rather than the else branch
export const removeIfElseBranchFilterRows = ({
  branchFilterGroupId,
  stepFilterGroups,
  stepFilters,
}: {
  branchFilterGroupId: string;
  stepFilterGroups: StepFilterGroup[];
  stepFilters: StepFilter[];
}): { stepFilterGroups: StepFilterGroup[]; stepFilters: StepFilter[] } => {
  const removedGroupIds = new Set<string>();
  let parentGroupIds = new Set([branchFilterGroupId]);

  while (parentGroupIds.size > 0) {
    const childGroupIds = stepFilterGroups
      .filter(
        ({ id, parentStepFilterGroupId }) =>
          parentGroupIds.has(parentStepFilterGroupId ?? '') &&
          !removedGroupIds.has(id),
      )
      .map(({ id }) => id);

    childGroupIds.forEach((groupId) => removedGroupIds.add(groupId));
    parentGroupIds = new Set(childGroupIds);
  }

  return {
    stepFilterGroups: stepFilterGroups.filter(
      ({ id }) => !removedGroupIds.has(id),
    ),
    stepFilters: stepFilters.filter(
      ({ stepFilterGroupId }) =>
        stepFilterGroupId !== branchFilterGroupId &&
        !removedGroupIds.has(stepFilterGroupId),
    ),
  };
};
