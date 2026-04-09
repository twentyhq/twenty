import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { type WorkflowStepConnectionOptions } from '@/workflow/workflow-diagram/workflow-iterator/types/WorkflowStepConnectionOptions';

type WorkflowInsertStepIdsState = {
  parentStepId: string | undefined;
  nextStepId: string | undefined;
  position?: { x: number; y: number };
  connectionOptions?: WorkflowStepConnectionOptions;
};

export const workflowInsertStepIdsComponentState =
  createAtomComponentState<WorkflowInsertStepIdsState>({
    key: 'workflowInsertStepIdsComponentState',
    defaultValue: {
      parentStepId: undefined,
      nextStepId: undefined,
      position: undefined,
      connectionOptions: undefined,
    },
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
