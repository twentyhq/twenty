import isEqual from 'lodash.isequal';
import { getOutputSchemaFromValue } from 'twenty-shared/logic-function';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import {
  type BaseOutputSchemaV2,
  isBaseOutputSchemaV2,
} from 'twenty-shared/workflow';

// the step types whose output schema the builder derived from a sample, as of 2.57
const SAMPLE_STEP_TYPES = new Set(['CODE', 'HTTP_REQUEST', 'LOGIC_FUNCTION']);

const convertOutputSchemaToSample = (
  outputSchema: BaseOutputSchemaV2,
): Record<string, unknown> | unknown[] => {
  const keys = Object.keys(outputSchema);

  const values = keys.map((key) => {
    const entry = outputSchema[key];

    return entry.isLeaf ? entry.value : convertOutputSchemaToSample(entry.value);
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
  declaredOutputSchemaByLogicFunctionId: Map<string, BaseOutputSchemaV2>;
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
    if (!isBaseOutputSchemaV2(outputSchema)) {
      return step;
    }

    const isDerivedFromExpectedOutput =
      isNonEmptySample(expectedOutputSchema) &&
      isEqual(getOutputSchemaFromValue(expectedOutputSchema), outputSchema);

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

    movedStepIds.push(String(step.id));

    return {
      ...step,
      settings: {
        ...step.settings,
        expectedOutputSchema: convertOutputSchemaToSample(outputSchema),
      },
    };
  });

  return {
    steps: movedStepIds.length > 0 ? rewrittenSteps : steps,
    movedStepIds,
  };
};
