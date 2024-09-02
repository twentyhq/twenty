import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { showPageWorkflowDiagramTriggerNodeSelectionState } from '@/workflow/states/showPageWorkflowDiagramTriggerNodeSelectionState';
import { workflowCreateStepFromParentStepIdState } from '@/workflow/states/workflowCreateStepFromParentStepIdState';
import {
  WorkflowStep,
  WorkflowStepType,
  WorkflowVersion,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { insertStep } from '@/workflow/utils/insertStep';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';
import { v4 } from 'uuid';

export const useRightDrawerWorkflowSelectActionCreateStep = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const workflowCreateStepFromParentStepId = useRecoilValue(
    workflowCreateStepFromParentStepIdState,
  );

  const setShowPageWorkflowDiagramTriggerNodeSelection = useSetRecoilState(
    showPageWorkflowDiagramTriggerNodeSelectionState,
  );

  const { updateOneRecord: updateOneWorkflowVersion } =
    useUpdateOneRecord<WorkflowVersion>({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const insertNodeAndSave = ({
    parentNodeId,
    nodeToAdd,
  }: {
    parentNodeId: string;
    nodeToAdd: WorkflowStep;
  }) => {
    const currentVersion = workflow.currentVersion;
    if (!isDefined(currentVersion)) {
      throw new Error("Can't add a node when there is no current version.");
    }

    return updateOneWorkflowVersion({
      idToUpdate: currentVersion.id,
      updateOneRecordInput: {
        steps: insertStep({
          steps: currentVersion.steps ?? [],
          parentStepId: parentNodeId,
          stepToAdd: nodeToAdd,
        }),
      },
    });
  };

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

  const createStep = async (newStepType: WorkflowStepType) => {
    if (workflowCreateStepFromParentStepId === undefined) {
      throw new Error('Select a step to create a new step from first.');
    }

    const newStep = getStepDefaultConfiguration(newStepType);

    /**
     * FIXME: For now, the data of the node to create are mostly static.
     */
    await insertNodeAndSave({
      parentNodeId: workflowCreateStepFromParentStepId,
      nodeToAdd: newStep,
    });

    /**
     * After the step has been created, select it.
     * As the `insertNodeAndSave` function mutates the cached workflow before resolving,
     * we are sure that the new node will have been created at this stage.
     *
     * Selecting the node will cause a right drawer to open in order to edit the step.
     */
    setShowPageWorkflowDiagramTriggerNodeSelection(newStep.id);
  };

  return {
    createStep,
  };
};
