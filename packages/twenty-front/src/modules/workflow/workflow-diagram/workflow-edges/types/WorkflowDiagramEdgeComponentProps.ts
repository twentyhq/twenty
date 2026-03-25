import { type WorkflowDiagramEdge } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { type EdgeProps } from '@xyflow/react';

export type WorkflowDiagramEdgeComponentProps =
  EdgeProps<WorkflowDiagramEdge> & {
    sourceHandleId: string;
    targetHandleId: string;
  };
