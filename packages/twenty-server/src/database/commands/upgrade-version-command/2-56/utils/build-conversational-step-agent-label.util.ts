import { isNonEmptyString } from '@sniptt/guards';
import { isNonEmptyArray } from 'twenty-shared/utils';

// what the step builder named its hidden agents, with a suffix per clone
const GENERATED_STEP_AGENT_LABEL_PATTERN = /^Workflow Agent( \S{4})*$/;

export const buildConversationalStepAgentLabel = ({
  currentLabel,
  workflowName,
  stepName,
}: {
  currentLabel: string;
  workflowName: string | null;
  stepName: string | null;
}): string => {
  const trimmedLabel = currentLabel.trim();

  if (
    isNonEmptyString(trimmedLabel) &&
    !GENERATED_STEP_AGENT_LABEL_PATTERN.test(trimmedLabel)
  ) {
    return currentLabel;
  }

  const labelParts = [workflowName?.trim(), stepName?.trim()].filter(
    (part): part is string => isNonEmptyString(part),
  );

  return isNonEmptyArray(labelParts) ? labelParts.join(' · ') : currentLabel;
};
