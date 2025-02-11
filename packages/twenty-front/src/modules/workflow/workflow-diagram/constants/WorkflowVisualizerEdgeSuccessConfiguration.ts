import { EDGE_GREEN_CIRCLE_MARKED_ID } from '@/workflow/workflow-diagram/constants/EdgeGreenCircleMarkedId';
import { EDGE_GREEN_ROUNDED_ARROW_MARKER_ID } from '@/workflow/workflow-diagram/constants/EdgeGreenRoundedArrowMarkerId';
import { WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const WORKFLOW_VISUALIZER_EDGE_SUCCESS_CONFIGURATION = {
  markerStart: EDGE_GREEN_CIRCLE_MARKED_ID,
  markerEnd: EDGE_GREEN_ROUNDED_ARROW_MARKER_ID,
  deletable: false,
  selectable: false,
} satisfies Partial<WorkflowDiagramEdge>;
