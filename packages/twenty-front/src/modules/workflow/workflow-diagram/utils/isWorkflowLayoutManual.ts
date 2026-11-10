import {
  type WorkflowAction,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';

// A node added without a position sends the whole diagram back to automatic layout
export const isWorkflowLayoutManual = ({
  trigger,
  steps,
}: {
  trigger: Pick<WorkflowTrigger, 'position'> | null;
  steps: Pick<WorkflowAction, 'position'>[] | null;
}): boolean =>
  (!isDefined(trigger) || isDefined(trigger.position)) &&
  (steps ?? []).every((step) => isDefined(step.position));
