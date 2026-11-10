import {
  type WorkflowAction,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { type WorkflowDiagram } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { getOrganizedDiagram } from '@/workflow/workflow-diagram/utils/getOrganizedDiagram';
import { isWorkflowLayoutManual } from '@/workflow/workflow-diagram/utils/isWorkflowLayoutManual';
import { isDefined } from 'twenty-shared/utils';

export const getDisplayedWorkflowDiagram = ({
  diagram,
  flow,
}: {
  diagram: WorkflowDiagram;
  flow:
    | {
        trigger: Pick<WorkflowTrigger, 'position'> | null;
        steps: Pick<WorkflowAction, 'position'>[] | null;
      }
    | undefined;
}): WorkflowDiagram =>
  !isDefined(flow) || isWorkflowLayoutManual(flow)
    ? diagram
    : getOrganizedDiagram(diagram);
