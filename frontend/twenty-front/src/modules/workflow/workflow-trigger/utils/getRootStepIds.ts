import { type WorkflowAction } from '@/workflow/types/Workflow';

export const getRootStepIds = (steps: WorkflowAction[]): string[] => {
  const childIds = new Set<string>();

  for (const step of steps) {
    step.nextStepIds?.forEach((id) => childIds.add(id));
  }

  return steps.filter((step) => !childIds.has(step.id)).map((step) => step.id);
};
