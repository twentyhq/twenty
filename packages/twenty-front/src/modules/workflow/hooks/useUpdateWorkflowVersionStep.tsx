import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  WorkflowStep,
  WorkflowVersion,
  WorkflowWithCurrentVersion,
} from '@/workflow/types/Workflow';
import { replaceStep } from '@/workflow/utils/replaceStep';
import { isDefined } from 'twenty-ui';

export const useUpdateWorkflowVersionStep = ({
  workflow,
  stepId,
}: {
  workflow: WorkflowWithCurrentVersion;
  stepId: string;
}) => {
  const { updateOneRecord: updateOneWorkflowVersion } =
    useUpdateOneRecord<WorkflowVersion>({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });

  const updateStep = async (updatedStep: WorkflowStep) => {
    if (!isDefined(workflow.currentVersion)) {
      throw new Error('Can not update an undefined workflow version.');
    }

    await updateOneWorkflowVersion({
      idToUpdate: workflow.currentVersion.id,
      updateOneRecordInput: {
        steps: replaceStep({
          steps: workflow.currentVersion.steps ?? [],
          stepId,
          stepToReplace: updatedStep,
        }),
      },
    });
  };

  return {
    updateStep,
  };
};
