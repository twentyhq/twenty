import { type WorkflowStepConnectionOptions } from '@/workflow/workflow-diagram/workflow-iterator/types/WorkflowStepConnectionOptions';
import { WORKFLOW_DIAGRAM_ITERATOR_NODE_LOOP_HANDLE_ID } from '@/workflow/workflow-diagram/workflow-nodes/constants/WorkflowDiagramIteratorNodeLoopHandleId';

export const getConnectionOptionsForSourceHandle = ({
  sourceHandleId,
}: {
  sourceHandleId: string;
}): WorkflowStepConnectionOptions | undefined => {
  switch (sourceHandleId) {
    case WORKFLOW_DIAGRAM_ITERATOR_NODE_LOOP_HANDLE_ID: {
      return {
        connectedStepType: 'ITERATOR',
        settings: {
          isConnectedToLoop: true,
        },
      };
    }
    default: {
      return undefined;
    }
  }
};
