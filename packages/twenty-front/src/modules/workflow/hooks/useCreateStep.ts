import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useCreateNewWorkflowVersion } from '@/workflow/hooks/useCreateNewWorkflowVersion';
import { workflowCreateStepFromParentStepIdState } from '@/workflow/states/workflowCreateStepFromParentStepIdState';
import { workflowDiagramTriggerNodeSelectionState } from '@/workflow/states/workflowDiagramTriggerNodeSelectionState';
import {
  WorkflowStep,
  WorkflowStepType,
  WorkflowVersion,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { getStepDefaultDefinition } from '@/workflow/utils/getStepDefaultDefinition';
import { insertStep } from '@/workflow/utils/insertStep';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';

export const useCreateStep = ({
  workflow,
}: {
  workflow: WorkflowWithCurrentVersion;
}) => {
  const workflowCreateStepFromParentStepId = useRecoilValue(
    workflowCreateStepFromParentStepIdState,
  );

  const setWorkflowDiagramTriggerNodeSelection = useSetRecoilState(
    workflowDiagramTriggerNodeSelectionState,
  );

  const { updateOneRecord: updateOneWorkflowVersion } =
    useUpdateOneRecord<WorkflowVersion>({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const { createNewWorkflowVersion } = useCreateNewWorkflowVersion();

  const insertNodeAndSave = async ({
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

    const updatedSteps = insertStep({
      steps: currentVersion.steps ?? [],
      parentStepId: parentNodeId,
      stepToAdd: nodeToAdd,
    });

    if (workflow.currentVersion.status === 'DRAFT') {
      await updateOneWorkflowVersion({
        idToUpdate: currentVersion.id,
        updateOneRecordInput: {
          steps: updatedSteps,
        },
      });

      return;
    }

    await createNewWorkflowVersion({
      workflowId: workflow.id,
      name: `v${workflow.versions.length + 1}`,
      status: 'DRAFT',
      trigger: workflow.currentVersion.trigger,
      steps: updatedSteps,
    });
  };

  const createStep = async (newStepType: WorkflowStepType) => {
    if (!isDefined(workflowCreateStepFromParentStepId)) {
      throw new Error('Select a step to create a new step from first.');
    }

    const newStep = getStepDefaultDefinition(newStepType);

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
    setWorkflowDiagramTriggerNodeSelection(newStep.id);
  };

  return {
    createStep,
  };
};
