import { WORKFLOW_STEP_DEFAULT_NAMES } from '@/workflow/constants/WorkflowStepDefaultNames';

export const getWorkflowAiAgentStepNameAfterKindChange = ({
  currentName,
  previousAgentLabel,
  nextDefaultName,
}: {
  currentName: string;
  previousAgentLabel: string | undefined;
  nextDefaultName: string;
}): string => {
  const isDefaultName =
    currentName === previousAgentLabel ||
    WORKFLOW_STEP_DEFAULT_NAMES.some(
      (stepDefaultName) =>
        stepDefaultName.type === 'AI_AGENT' &&
        stepDefaultName.name === currentName,
    );

  return isDefaultName ? nextDefaultName : currentName;
};
