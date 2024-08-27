import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  Workflow,
  WorkflowStep,
  WorkflowVersion,
} from '@/workflow/types/Workflow';
import { getWorkflowLastVersion } from '@/workflow/utils/getWorkflowLastVersion';
import { insertStep } from '@/workflow/utils/insertStep';

export const useCreateNode = ({ workflow }: { workflow: Workflow }) => {
  const { updateOneRecord: updateOneWorkflowVersion } =
    useUpdateOneRecord<WorkflowVersion>({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const createNode = ({
    parentNodeId,
    nodeToAdd,
  }: {
    parentNodeId: string;
    nodeToAdd: WorkflowStep;
  }) => {
    const lastVersion = getWorkflowLastVersion(workflow);
    if (lastVersion === undefined) {
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

  return {
    createNode,
  };
};
