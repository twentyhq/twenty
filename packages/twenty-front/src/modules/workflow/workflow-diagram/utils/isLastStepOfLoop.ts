import {
  type WorkflowIteratorAction,
  type WorkflowStep,
} from '@/workflow/types/Workflow';
import { isNonEmptyArray } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const isLastStepOfLoop = ({
  iterator,
  stepId,
  steps,
}: {
  iterator: WorkflowIteratorAction;
  stepId: string;
  steps: WorkflowStep[];
}): boolean => {
  const stepMap = new Map<string, WorkflowStep>(steps.map((s) => [s.id, s]));
  const visited = new Set<string>();
  const queue = [...(iterator.settings.input?.initialLoopStepIds ?? [])];

  while (queue.length > 0) {
    const currentId = queue.shift();

    if (!isDefined(currentId) || visited.has(currentId)) {
      continue;
    }

    visited.add(currentId);

    const currentStep = stepMap.get(currentId);

    if (!isDefined(currentStep)) {
      continue;
    }

    if (
      currentId === stepId &&
      currentStep.nextStepIds?.includes(iterator.id) === true
    ) {
      return true;
    }

    if (isNonEmptyArray(currentStep.nextStepIds)) {
      for (const nextId of currentStep.nextStepIds) {
        queue.push(nextId);
      }
    }
  }

  return false;
};
