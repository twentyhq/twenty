import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { showPageWorkflowDiagramTriggerNodeSelectionState } from '@/workflow/states/showPageWorkflowDiagramTriggerNodeSelectionState';
import { workflowCreateStepFromParentStepIdState } from '@/workflow/states/workflowCreateStepFromParentStepIdState';
import {
  Workflow,
  WorkflowStep,
  WorkflowStepType,
  WorkflowVersion,
} from '@/workflow/types/Workflow';
import { getWorkflowLastVersion } from '@/workflow/utils/getWorkflowLastVersion';
import { insertStep } from '@/workflow/utils/insertStep';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';
import { v4 } from 'uuid';

export const useRightDrawerWorkflowSelectActionCreateStep = ({
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
    const lastVersion = getWorkflowLastVersion(workflow);
    if (!isDefined(lastVersion)) {
      throw new Error(
        "Can't add a node when no version exists yet. Create a first workflow version before trying to add a node.",
      );
    }

    return updateOneWorkflowVersion({
      idToUpdate: lastVersion.id,
      updateOneRecordInput: {
        steps: insertStep({
          steps: lastVersion.steps,
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
