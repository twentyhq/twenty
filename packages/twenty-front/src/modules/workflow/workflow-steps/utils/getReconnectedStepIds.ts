import { isDefined } from 'twenty-shared/utils';

export const getReconnectedStepIds = ({
  nextStepIds,
  oldTargetId,
  newTargetId,
}: {
  nextStepIds: string[] | null | undefined;
  oldTargetId: string;
  newTargetId: string;
}): string[] | undefined => {
  if (
    !isDefined(nextStepIds) ||
    !nextStepIds.includes(oldTargetId) ||
    nextStepIds.includes(newTargetId)
  ) {
    return undefined;
  }

  return nextStepIds.map((stepId) =>
    stepId === oldTargetId ? newTargetId : stepId,
  );
};
