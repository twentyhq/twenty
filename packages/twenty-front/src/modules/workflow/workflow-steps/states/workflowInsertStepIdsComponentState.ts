import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { type WorkflowStepConnectionOptions } from '@/workflow/workflow-diagram/workflow-iterator/types/WorkflowStepConnectionOptions';

type WorkflowInsertStepIdsState = {
  parentStepId: string | undefined;
  nextStepId: string | undefined;
  position?: { x: number; y: number };
  connectionOptions?: WorkflowStepConnectionOptions;
};

export const workflowInsertStepIdsComponentState =
  createComponentState<WorkflowInsertStepIdsState>({
    key: 'workflowInsertStepIdsComponentState',
    defaultValue: {
      parentStepId: undefined,
      nextStepId: undefined,
      position: undefined,
      connectionOptions: undefined,
    },
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
