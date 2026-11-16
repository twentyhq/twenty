import { isDefined } from 'twenty-shared/utils';

type NodePosition = { x: number; y: number };

export const hasUnpositionedWorkflowNode = (flow: {
  trigger: { position?: NodePosition | null } | null;
  steps: { position?: NodePosition | null }[] | null;
}): boolean =>
  (isDefined(flow.trigger) && !isDefined(flow.trigger.position)) ||
  (flow.steps ?? []).some((step) => !isDefined(step.position));
