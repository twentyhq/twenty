import { type getFlowPositions } from '@/workflow/utils/getFlowPositions';
import { isDefined } from 'twenty-shared/utils';

export const hasUnpositionedWorkflowNode = (
  flow: NonNullable<Parameters<typeof getFlowPositions>[0]>,
): boolean =>
  (isDefined(flow.trigger) && !isDefined(flow.trigger.position)) ||
  (flow.steps ?? []).some((step) => !isDefined(step.position));
