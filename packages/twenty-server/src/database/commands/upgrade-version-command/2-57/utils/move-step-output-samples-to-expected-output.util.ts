import isEqual from 'lodash.isequal';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { getOutputSchemaFromSample } from 'src/database/commands/upgrade-version-command/2-57/utils/get-output-schema-from-sample.util';
import { isStoredOutputSchema } from 'src/database/commands/upgrade-version-command/2-57/utils/is-stored-output-schema.util';

const SAMPLE_STEP_TYPES = new Set(['CODE', 'HTTP_REQUEST', 'LOGIC_FUNCTION']);

const convertOutputSchemaToSample = (
  outputSchema: Record<string, unknown>,
): Record<string, unknown> | unknown[] => {
  const keys = Object.keys(outputSchema);

  const values = keys.map((key) => {
    const entry = outputSchema[key];

    if (!isPlainObject(entry)) {
      return entry;
    }

    // a node whose value is not an object holds that value, like a leaf
    return entry.isLeaf === false && isPlainObject(entry.value)
      ? convertOutputSchemaToSample(entry.value)
      : entry.value;
  });

  if (keys.length > 0 && keys.every((key, index) => key === String(index))) {
    return values;
  }

  return Object.fromEntries(keys.map((key, index) => [key, values[index]]));
};

const isNonEmptySample = (sample: unknown): sample is object =>
  (isPlainObject(sample) || Array.isArray(sample)) &&
  Object.keys(sample).length > 0;

export const moveStepOutputSamplesToExpectedOutput = ({
  steps,
  declaredOutputSchemaByLogicFunctionId,
}: {
  steps: unknown;
  declaredOutputSchemaByLogicFunctionId: Map<string, Record<string, unknown>>;
}): { steps: unknown; movedStepIds: string[] } => {
  if (!Array.isArray(steps)) {
    return { steps, movedStepIds: [] };
  }

  const movedStepIds: string[] = [];

  const rewrittenSteps = steps.map((step) => {
    if (
      !isPlainObject(step) ||
      !SAMPLE_STEP_TYPES.has(String(step.type)) ||
      !isPlainObject(step.settings)
    ) {
      return step;
    }

    const { outputSchema, expectedOutputSchema, input } = step.settings;

    // a legacy placeholder such as the LINK one is not an output, so it has no sample to move
    if (!isStoredOutputSchema(outputSchema)) {
      return step;
    }

    const isDerivedFromExpectedOutput =
      isNonEmptySample(expectedOutputSchema) &&
      isEqual(getOutputSchemaFromSample(expectedOutputSchema), outputSchema);

    const declaredOutputSchema =
      step.type === 'LOGIC_FUNCTION' && isPlainObject(input)
        ? declaredOutputSchemaByLogicFunctionId.get(
            String(input.logicFunctionId),
          )
        : undefined;

    if (
      isDerivedFromExpectedOutput ||
      (isDefined(declaredOutputSchema) &&
        isEqual(declaredOutputSchema, outputSchema))
    ) {
      return step;
    }

    const sample = convertOutputSchemaToSample(outputSchema);

    if (isEqual(sample, expectedOutputSchema)) {
      return step;
    }

    movedStepIds.push(String(step.id));

    return {
      ...step,
      settings: { ...step.settings, expectedOutputSchema: sample },
    };
  });

  return {
    steps: movedStepIds.length > 0 ? rewrittenSteps : steps,
    movedStepIds,
  };
};
