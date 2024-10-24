import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useCreateNewWorkflowVersion } from '@/workflow/hooks/useCreateNewWorkflowVersion';
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

  const { createNewWorkflowVersion } = useCreateNewWorkflowVersion();

  const updateStep = async <T extends WorkflowStep>(updatedStep: T) => {
    if (!isDefined(workflow.currentVersion)) {
      throw new Error('Can not update an undefined workflow version.');
    }

    const updatedSteps = replaceStep({
      steps: workflow.currentVersion.steps ?? [],
      stepId,
      stepToReplace: updatedStep,
    });

    if (workflow.currentVersion.status === 'DRAFT') {
      await updateOneWorkflowVersion({
        idToUpdate: workflow.currentVersion.id,
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

  return {
    updateStep,
  };
};
