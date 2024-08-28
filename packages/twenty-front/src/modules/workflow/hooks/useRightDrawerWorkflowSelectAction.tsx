import { useCreateNode } from '@/workflow/hooks/useCreateNode';
import { showPageWorkflowDiagramTriggerNodeSelectionState } from '@/workflow/states/showPageWorkflowDiagramTriggerNodeSelectionState';
import { workflowCreateStepFromParentStepIdState } from '@/workflow/states/workflowCreateStepFromParentStepIdState';
import {
  Workflow,
  WorkflowStep,
  WorkflowStepType,
} from '@/workflow/types/Workflow';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';

export const useRightDrawerWorkflowSelectAction = ({
  workflow,
}: {
  workflow: Workflow;
}) => {
  const workflowCreateStepFromParentStepId = useRecoilValue(
    workflowCreateStepFromParentStepIdState,
  );

  const setShowPageWorkflowDiagramTriggerNodeSelection = useSetRecoilState(
    showPageWorkflowDiagramTriggerNodeSelectionState,
  );

  const { createNode } = useCreateNode({ workflow });

  const getStepDefaultConfiguration = (
    type: WorkflowStepType,
  ): WorkflowStep => {
    const newStepId = v4();

    switch (type) {
      case 'CODE_ACTION': {
        return {
          id: newStepId,
          name: 'Code',
          type: 'CODE_ACTION',
          valid: false,
          settings: {
            serverlessFunctionId: '',
            errorHandlingOptions: {
              continueOnFailure: {
                value: false,
              },
              retryOnFailure: {
                value: false,
              },
            },
          },
        };
      }
      default: {
        throw new Error(`Unknown type: ${type}`);
      }
    }
  };

  const handleActionClick = async (newStepType: WorkflowStepType) => {
    if (workflowCreateStepFromParentStepId === undefined) {
      throw new Error('Select a step to create a new step from first.');
    }

    const newStep = getStepDefaultConfiguration(newStepType);

    /**
     * FIXME: For now, the data of the node to create are mostly static.
     */
    await createNode({
      parentNodeId: workflowCreateStepFromParentStepId,
      nodeToAdd: newStep,
    });

    /**
     * After the step has been created, select it.
     * As the `createNode` function mutates the cached workflow before resolving,
     * we are sure that the new node will have been created at this stage.
     *
     * Selecting the node will cause a right drawer to open in order to edit the step.
     */
    setShowPageWorkflowDiagramTriggerNodeSelection(newStep.id);
  };

  return {
    handleActionClick,
  };
};
