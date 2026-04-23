import { type WorkflowStep } from '@/workflow/types/Workflow';
import { isObject, isString } from '@sniptt/guards';
import { CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX } from 'twenty-shared/workflow';
import { type JsonValue } from 'type-fest';

function* resolveVariables(value: JsonValue): Generator<string> {
  if (isString(value)) {
    for (const [, variablePath] of value.matchAll(
      CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
    )) {
      yield variablePath;
    }

    return;
  }

  if (isObject(value)) {
    for (const nestedValue of Object.values(value)) {
      yield* resolveVariables(nestedValue);
    }
  }
}

export const getWorkflowVariablesUsedInStep = ({
  step,
}: {
  step: WorkflowStep;
}) => {
  const variablesUsedInStep = new Set<string>();

  for (const variable of resolveVariables(step.settings.input)) {
    variablesUsedInStep.add(variable);
  }

  return variablesUsedInStep;
};
