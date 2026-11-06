import isEqual from 'lodash.isequal';
import { getOutputSchemaFromValue } from 'twenty-shared/logic-function';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

// the step types whose output schema the builder derived from a sample, as of 2.57
const SAMPLE_STEP_TYPES = new Set(['CODE', 'HTTP_REQUEST', 'LOGIC_FUNCTION']);

type StoredSchemaEntry = { isLeaf?: boolean; value?: unknown };

const convertOutputSchemaToSample = (
  outputSchema: Record<string, unknown>,
): Record<string, unknown> | unknown[] => {
  const keys = Object.keys(outputSchema);

  const toValue = (entry: unknown) => {
    const { isLeaf, value } = (entry ?? {}) as StoredSchemaEntry;

    return isLeaf === false && isPlainObject(value)
      ? convertOutputSchemaToSample(value)
      : value;
  };

  if (keys.length > 0 && keys.every((key, index) => key === String(index))) {
    return keys.map((key) => toValue(outputSchema[key]));
  }

  return Object.fromEntries(
    keys.map((key) => [key, toValue(outputSchema[key])]),
  );
};

const isNonEmptySample = (sample: unknown): sample is object =>
  (isPlainObject(sample) || Array.isArray(sample)) &&
  Object.keys(sample).length > 0;

export const moveStepOutputSamplesToExpectedOutput = ({
  steps,
  declaredOutputSchemaByLogicFunctionId,
}: {
  steps: unknown;
  declaredOutputSchemaByLogicFunctionId: Map<string, unknown>;
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

    const { outputSchema, expectedOutputSchema } = step.settings;

    if (
      !isPlainObject(outputSchema) ||
      Object.keys(outputSchema).length === 0
    ) {
      return step;
    }

    const isDerivedFromExpectedOutput =
      isNonEmptySample(expectedOutputSchema) &&
      isEqual(getOutputSchemaFromValue(expectedOutputSchema), outputSchema);

    const logicFunctionId = isPlainObject(step.settings.input)
      ? step.settings.input.logicFunctionId
      : undefined;

    const declaredOutputSchema =
      step.type === 'LOGIC_FUNCTION' && isDefined(logicFunctionId)
        ? declaredOutputSchemaByLogicFunctionId.get(String(logicFunctionId))
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
