import { WorkflowStep } from '@/workflow/types/Workflow';
import { CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX } from '@/workflow/workflow-variables/constants/CaptureAllVariableTagInnerRegex';
import { isObject, isString } from '@sniptt/guards';
import { JsonValue } from 'type-fest';

function* resolveVariables(value: JsonValue): Generator<string> {
  if (isString(value)) {
    for (const [, match] of value.matchAll(
      CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
    )) {
      yield match;
    }

    return;
  }

  if (isObject(value)) {
    for (const nestedValue of Object.values(value)) {
      yield* resolveVariables(nestedValue);
    }
  }
}

export const getVariablesUsedInStep = ({ step }: { step: WorkflowStep }) => {
  const flowVariables = new Set<string>();

  for (const variable of resolveVariables(step.settings.input)) {
    flowVariables.add(variable);
  }

  return flowVariables;
};
